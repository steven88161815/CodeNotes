# app/dags/pdm_api_etl_utils/pdm_api_full_load.py

import pandas as pd
from datetime import datetime
from typing import List, Tuple, Dict, Any, Callable, Optional
from contextlib import closing

from airflow.models import Variable
from airflow.providers.http.hooks.http import HttpHook
from airflow.providers.oracle.hooks.oracle import OracleHook
from airflow.exceptions import AirflowException
from app.dags import utils
from app.dags.schemas import PqoSysEtlPerfLog, PqoSysEtlCtrlLog

def pdm_api_full_load_task(
    api_endpoint: str,
    table_name: str,
    transform_func: Callable[[pd.DataFrame], pd.DataFrame],
    generate_sql_func: Callable[[pd.DataFrame], List[Tuple[str, str, str]]],
    pdm_api_conn_id: str,
    **kwargs
):
    """
    Generic framework for PDM API -> Oracle DB Full Load (DELETE + INSERT) ETL tasks.
    Handles the process of extracting data from a PDM API, transforming it,
    and performing a full load into an Oracle table.
    Ensures atomic transaction processing and logs performance/control data.

    Args:
        api_endpoint (str): The specific PDM API endpoint (e.g., "/TI_GUI_MB/rest/TiWebService/getTiProcOptByMicrCodeAndStatus").
        table_name (str): The target Oracle database table name (e.g., "TI_PROC_OPT").
        transform_func (Callable[[pd.DataFrame], pd.DataFrame]):
            A function that takes the raw DataFrame and returns a transformed DataFrame.
        generate_sql_func (Callable[[pd.DataFrame], List[Tuple[str, str, str]]]):
            A function that takes the transformed DataFrame and returns a list of INSERT SQL statements.
        pdm_api_conn_id (str): The Airflow Connection ID for the PDM API.
        **kwargs: Airflow-provided parameters, must include 'oracle_conn_id'.
    """
    start_time = datetime.now()
    oracle_conn_id = kwargs['oracle_conn_id']
    etl_name = f"ETL_PQO_{table_name.upper()}"
    target_table = table_name

    # --- E: Extract Phase ---
    pdm_http_hook = HttpHook(http_conn_id=pdm_api_conn_id, method='GET')
    pdm_conn = pdm_http_hook.get_connection(pdm_api_conn_id)
    
    full_api_url = f"{pdm_conn.host}{api_endpoint}"
    
    try:
        print(f"Fetching data from PDM API: {full_api_url}")
        response = pdm_http_hook.run(
            endpoint=api_endpoint,
            headers={"Content-Type": "application/json"},
            extra_options={"timeout": 60}
        )
        response.raise_for_status() # Raises HTTPError for bad responses (4xx or 5xx)
        data = response.json()
        if not data:
            print("PDM API returned no data. Skipping ETL load phase.")
            perf_row = PqoSysEtlPerfLog(
                fail_count=0,
                total_count=0,
                start_time=start_time,
                etl_name=etl_name,
            )
            utils.pqo_sys_etl_perf_log(oracle_conn_id, perf_row)
            return # Exit the task early

        source_data_df = pd.DataFrame(data)
        print(f"Extracted {len(source_data_df)} records from PDM API for {table_name}.")

    except AirflowException as e:
        # For API specific errors, we log it here.
        # This ensures API connection/response errors are also captured in PqoSysEtlCtrlLog.
        
        # Attempt to extract the status code from AirflowException, if possible
        try:
            # AirflowException format is typically "STATUS_CODE:REASON"
            # e.g., "401:Unauthorized"
            status_code_str = str(e).split(':')[0]
            sql_code_val = int(status_code_str)
        except (ValueError, IndexError):
            # If the AirflowException format is not the expected "CODE:MESSAGE"
            # or cannot be converted to an integer, use a default API failure code
            sql_code_val = 999 # e.g., 999 for unknown API error
            
        ctrl_keys_overall = "API_ERROR"
        ctrl_row_overall = PqoSysEtlCtrlLog(
            keys=ctrl_keys_overall,
            etl_name=etl_name,
            target_table=target_table,
            sql_code=sql_code_val,
            desc=f"PDM API request failed: {e}",
        )
        utils.pqo_sys_etl_ctrl_log(oracle_conn_id, ctrl_row_overall)
        # Performance log for API failure
        perf_row_fail = PqoSysEtlPerfLog(
            fail_count=1,
            total_count=0, # No records processed from API
            start_time=start_time,
            etl_name=etl_name,
        )
        utils.pqo_sys_etl_perf_log(oracle_conn_id, perf_row_fail)
        raise # Re-raise to mark task as failed

    # --- T: Transform Phase ---
    processed_data_df: pd.DataFrame = transform_func(source_data_df)
    print(f"Transformed {len(processed_data_df)} records for {table_name}.")

    # --- L: Load Phase ---
    # 1. Generate DELETE FROM statement
    delete_sql_str = f"DELETE FROM {target_table}"
    # Wrap the DELETE statement into the format expected by execute_sql_batch_without_commit
    delete_sql_meta: List[Tuple[str, str, str]] = [
        ("GLOBAL_DELETE_KEY", delete_sql_str, f"Failed to delete all existing records from {target_table}")
    ]

    # 2. Generate list of INSERT statements
    insert_sql_list: List[Tuple[str, str, str]] = generate_sql_func(processed_data_df)

    # Initialize OracleHook
    oracle_hook = OracleHook(oracle_conn_id=oracle_conn_id)

    total_records_to_insert = 0
    failed_insert_count = 0
    
    # Flag to indicate if the overall transaction failed due to any reason
    overall_transaction_failed = False

    with closing(oracle_hook.get_conn()) as conn:
        try:
            # Execute DELETE operation using the shared utility
            print(f"Deleting all existing data from target table {target_table} using shared utility...")
            delete_batch_result = utils.execute_sql_batch_without_commit(
                conn=conn,
                oracle_conn_id=oracle_conn_id,
                sql_statements_with_meta=delete_sql_meta,
                etl_name=etl_name,
                target_table=target_table
            )
            
            # Check if DELETE operation itself failed
            if delete_batch_result["failed_count"] > 0:
                conn.rollback() # Rollback the transaction if DELETE failed
                print(f"DELETE operation failed for {target_table}. Details already logged. Transaction rolled back.")
                overall_transaction_failed = True # Mark as failed
            else:
                print(f"All data from {target_table} deleted.")

            # Only proceed with INSERT if DELETE was successful
            if not overall_transaction_failed:
                # Execute batch INSERT operation using the shared utility
                print(f"Inserting {len(insert_sql_list)} records into {target_table} using shared utility...")

                insert_batch_result = utils.execute_sql_batch_without_commit(
                    conn=conn,
                    oracle_conn_id=oracle_conn_id,
                    sql_statements_with_meta=insert_sql_list,
                    etl_name=etl_name,
                    target_table=target_table
                )

                total_records_to_insert = insert_batch_result["total_processed"]
                failed_insert_count = insert_batch_result["failed_count"]

                # Decide whether to commit or rollback the entire transaction based on batch results
                if failed_insert_count > 0:
                    conn.rollback() # Rollback the entire transaction (including DELETE and all INSERTS)
                    print(f"In {etl_name} task, {failed_insert_count} records failed to insert. Details already logged. Transaction rolled back.")
                    overall_transaction_failed = True # Mark as failed
                else:
                    conn.commit() # Commit the entire transaction
                    print(f"Successfully inserted {total_records_to_insert} records into {target_table}.")

        except Exception as e:
            # This catch-all block is for errors not explicitly handled above
            # (e.g., connection errors, unexpected Python errors within the try block)
            conn.rollback() # Ensure transaction is rolled back for any unhandled exception
            print(f"ETL load phase encountered an unexpected error. Transaction rolled back: {e}")

            try:
                # First, try to get a specific SQL code if the exception string matches
                sql_code_val = utils.get_sql_code(str(e))
            except AssertionError:
                # If utils.get_sql_code asserts (meaning no match for SQL error),
                # or if it's a non-SQL Python error, assign a generic code.
                sql_code_val = 998 # A different generic code for unexpected non-API/non-SQL errors

            ctrl_keys_overall = f"UNEXPECTED_ERROR"
            ctrl_row_overall = PqoSysEtlCtrlLog(
                keys=ctrl_keys_overall,
                etl_name=etl_name,
                target_table=target_table,
                sql_code=sql_code_val,
                desc=f"Unexpected error during load phase: {e}",
            )
            utils.pqo_sys_etl_ctrl_log(oracle_conn_id, ctrl_row_overall)

            overall_transaction_failed = True # Mark as failed

        finally:
            # Performance log should always run, regardless of success or failure
            # If overall_transaction_failed is true, then the task will ultimately fail.
            # The failed_insert_count will correctly reflect the count of failed inserts,
            # or 1 if DELETE failed, or 1 if an unexpected error occurred.
            
            # Adjust fail_count for performance log based on overall failure
            perf_fail_count = failed_insert_count
            if overall_transaction_failed and perf_fail_count == 0:
                # If transaction failed for reasons other than specific insert failures (e.g., DELETE failed, or unexpected error)
                perf_fail_count = 1 # Mark at least one failure for performance log
                
            perf_row = PqoSysEtlPerfLog(
                fail_count=perf_fail_count,
                total_count=total_records_to_insert,
                start_time=start_time,
                etl_name=etl_name,
            )
            utils.pqo_sys_etl_perf_log(oracle_conn_id, perf_row)

            if overall_transaction_failed:
                # Raise an exception here to ensure Airflow marks the task as failed
                # This exception doesn't need to be caught by the outer block, as it's the final failure signal.
                raise Exception(f"ETL task '{etl_name}' for table '{target_table}' failed. Check logs for details.")

    # If we reach here, it means the entire transaction was successful and committed.
    print(f"ETL task completed. Successfully loaded {total_records_to_insert - failed_insert_count} records, {failed_insert_count} failed.")