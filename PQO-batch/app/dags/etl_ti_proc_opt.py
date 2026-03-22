"""
DAG for ETL_TI_PROC_OPT:
Extracts TiProcOpt data from PDM API, transforms it, and loads it into Oracle DB.
This DAG performs a full load (delete all existing records and insert new ones)
within an atomic transaction.
"""
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Tuple, Any
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.models import Variable

from app.dags.pdm_api_etl_utils.pdm_api_full_load import pdm_api_full_load_task
from app.dags.pdm_api_etl_utils.sql_utils import to_sql_value

# --- Airflow Variables ---
email_receiver: str = Variable.get("PQO_EMAIL_RECEIVER", "")
default_args = {
    "owner": "CCPD",
    "depends_on_past": False,
    "start_date": datetime(2026, 1, 1),
    "email": email_receiver,
    "email_on_failure": True,
}

# --- Transformation Logic ---
def _process_ti_proc_opt_data(source_df: pd.DataFrame) -> pd.DataFrame:
    """
    Core logic: Transforms TiProcOptTo data to TiProcOpt format.
    This function simulates the ItemProcessor part in Java Spring Batch.
    """
    if source_df.empty:
        return pd.DataFrame()

    processed_df = source_df.copy()

    # Convert createDt from Unix timestamp (milliseconds) to datetime object
    if 'createDt' in processed_df.columns:
        processed_df['createDt'] = processed_df['createDt'].apply(
            lambda x: datetime.fromtimestamp(x / 1000)
            if pd.notna(x) and isinstance(x, (int, float))
            else (datetime.fromtimestamp(float(x) / 1000) if pd.notna(x) and isinstance(x, str) and str(x).isdigit() else x)
        )

    # Ensure 'updateDt' is the current timestamp as per Java processor logic
    processed_df['updateDt'] = datetime.now()
    processed_df['updateUser'] = 'PQO-PDMEtl'

    return processed_df

# --- SQL Generation Logic ---
def _generate_ti_proc_opt_insert_sql(dataframe: pd.DataFrame) -> List[Tuple[str, str, str]]:
    """
    Core logic: Generates a list of INSERT SQL statements for TI_PROC_OPT.
    This function simulates the ItemWriter part in Java Spring Batch.
    """
    sql_statements: List[Tuple[str, str, str]] = []
    if dataframe.empty:
        return sql_statements

    for row in dataframe.itertuples(index=False):
        # Use getattr to safely access attributes, providing None as default
        # IMPORTANT: Use camelCase column names as returned by PDM API and processed DataFrame
        proc_opt_seq_sql = to_sql_value(getattr(row, 'procOptSeq', None))
        is_eng_sql = to_sql_value(getattr(row, 'isEng', None))
        micr_code_sql = to_sql_value(getattr(row, 'micrCode', None))
        proc_group_mask_cnt_sql = to_sql_value(getattr(row, 'procGroupMaskCnt', None))
        proc_group_name_sql = to_sql_value(getattr(row, 'procGroupName', None))
        proc_group_type_desc_sql = to_sql_value(getattr(row, 'procGroupTypeDesc', None))
        proc_group_type_sql = to_sql_value(getattr(row, 'procGroupType', None))
        remark_sql = to_sql_value(getattr(row, 'remark', None))
        status_sql = to_sql_value(getattr(row, 'status', None))
        
        # createDt and updateDt are now handled by to_sql_value directly
        create_dt_sql = to_sql_value(getattr(row, 'createDt', None))
        create_user_sql = to_sql_value(getattr(row, 'createUser', None))
        update_dt_sql = to_sql_value(getattr(row, 'updateDt', None)) # Should always be a datetime object from processor
        update_user_sql = to_sql_value(getattr(row, 'updateUser', None)) # Should always be a string from processor

        sql = f"""
        INSERT INTO ti_proc_opt (
            PROC_OPT_SEQ, IS_ENG, MICR_CODE, PROC_GROUP_MASK_CNT, PROC_GROUP_NAME,
            PROC_GROUP_TYPE_DESC, PROC_GROUP_TYPE, REMARK, STATUS, CREATE_DT,
            CREATE_USER, UPDATE_DT, UPDATE_USER
        ) VALUES (
            {proc_opt_seq_sql}, {is_eng_sql}, {micr_code_sql}, {proc_group_mask_cnt_sql}, {proc_group_name_sql},
            {proc_group_type_desc_sql}, {proc_group_type_sql}, {remark_sql}, {status_sql}, {create_dt_sql},
            {create_user_sql}, {update_dt_sql}, {update_user_sql}
        )
        """
        # Unique identifier for the record, used for logging and error reporting
        key_identifier = f"{proc_opt_seq_sql}"
        sql_statements.append((key_identifier, sql, f"Failed to insert TiProcOpt record with identifier: {key_identifier}"))
    return sql_statements


# --- DAG Definition ---
dag_ti_proc_opt = DAG(
    "ETL_PQO_TI_PROC_OPT",
    default_args=default_args,
    description="ETL job for pushing TiProcOpt data from PDM API to Oracle (Full Load with Atomic Transaction)",
    tags=["pqo_batch", "ccpd", "etl", "pdm_api"],
    schedule="45 1-23/2 * * *",
    catchup=False,
    max_active_runs=1,
)


with dag_ti_proc_opt:
    etl_full_load_task = PythonOperator(
        task_id="etl_ti_proc_opt_full_load",
        python_callable=pdm_api_full_load_task, # Calling the renamed generic function
        op_kwargs={
            "api_endpoint": "/TI_GUI_MB/rest/TiWebService/getTiProcOptByMicrCodeAndStatus",
            "table_name": "TI_PROC_OPT",
            "transform_func": _process_ti_proc_opt_data,
            "generate_sql_func": _generate_ti_proc_opt_insert_sql,
            "pdm_api_conn_id": "pdm_api_conn",
            "oracle_conn_id": "pqo_db",
        },
        retries=5,
        retry_delay=timedelta(seconds=10),
        retry_exponential_backoff=True,
        max_retry_delay=timedelta(minutes=5),
        dag=dag_ti_proc_opt,
    )