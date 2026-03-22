"""
DAG for ETL_PQO_PUSH_TI_RAW_WAFER_QUES:
Extracts TiRawWaferQues data from PDM API, transforms it, and loads it into Oracle DB.
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

# transformation logic
def _process_ti_raw_wafer_ques_data(source_df: pd.DataFrame) -> pd.DataFrame:
    """
    Core logic: Transforms TiRawWaferQuesTo data to TiRawWaferQues format.
    This function simulates the ItemProcessor part in Java Spring Batch.
    """
    if source_df.empty:
        return pd.DataFrame()

    processed_df = source_df.copy()

    if 'createDt' in processed_df.columns:
        processed_df['createDt'] = processed_df['createDt'].apply(
            lambda x: datetime.fromtimestamp(x / 1000)
            if pd.notna(x) and isinstance(x, (int, float))
            else (datetime.fromtimestamp(float(x) / 1000) if pd.notna(x) and isinstance(x, str) and x.isdigit() else x)
        )

    processed_df['updateDt'] = datetime.now()
    processed_df['updateUser'] = 'PQO-PDMEtl'

    # Specific transformation for valueProcOpt: replace "-" with ""
    # Only apply if 'valueProcOpt' column exists and value is not NaN/None
    if 'valueProcOpt' in processed_df.columns:
        processed_df['valueProcOpt'] = processed_df['valueProcOpt'].apply(
            lambda x: str(x).replace("-", "") if pd.notna(x) else None
        )

    return processed_df

# SQL generation logic
def _generate_ti_raw_wafer_ques_insert_sql(dataframe: pd.DataFrame) -> List[Tuple[str, str, str]]:
    """
    Core logic: Generates a list of INSERT SQL statements for TI_RAW_WAFER_QUES.
    This function simulates the ItemWriter part in Java Spring Batch.
    """
    sql_statements: List[Tuple[str, str, str]] = []
    if dataframe.empty:
        return sql_statements

    for row in dataframe.itertuples(index=False):
        tf1_cd_sql = to_sql_value(getattr(row, 'tf1Cd', None))
        geom_cd_sql = to_sql_value(getattr(row, 'geomCd', None))
        wf_tl2_cd_sql = to_sql_value(getattr(row, 'wfTl2Cd', None))
        wf_tl3_cd_sql = to_sql_value(getattr(row, 'wfTl3Cd', None))
        wf_tl4_cd_sql = to_sql_value(getattr(row, 'wfTl4Cd', None))
        ques_id_sql = to_sql_value(getattr(row, 'quesId', None))

        file_name_sql = to_sql_value(getattr(row, 'fileName', None))
        remark_sql = to_sql_value(getattr(row, 'remark', None))
        status_sql = to_sql_value(getattr(row, 'status', None))
        value_proc_opt_sql = to_sql_value(getattr(row, 'valueProcOpt', None))

        create_dt_sql = to_sql_value(getattr(row, 'createDt', None))
        create_user_sql = to_sql_value(getattr(row, 'createUser', None))
        update_dt_sql = to_sql_value(getattr(row, 'updateDt', None)) # Should always be a datetime object from processor
        update_user_sql = to_sql_value(getattr(row, 'updateUser', None)) # Should always be a string from processor

        sql = f"""
        INSERT INTO ti_raw_wafer_ques (
            TF1_CD, GEOM_CD, WF_TL2_CD, WF_TL3_CD, WF_TL4_CD, QUES_ID,
            CREATE_DT, CREATE_USER, FILE_NAME, REMARK, STATUS, UPDATE_DT, UPDATE_USER, VALUE_PROC_OPT
        ) VALUES (
            {tf1_cd_sql}, {geom_cd_sql}, {wf_tl2_cd_sql}, {wf_tl3_cd_sql}, {wf_tl4_cd_sql}, {ques_id_sql},
            {create_dt_sql}, {create_user_sql}, {file_name_sql}, {remark_sql}, {status_sql}, {update_dt_sql}, {update_user_sql}, {value_proc_opt_sql}
        )
        """
        # Unique identifier for the record (composite primary key for logging)
        key_identifier = (
            f"{tf1_cd_sql};{geom_cd_sql};{wf_tl2_cd_sql};{wf_tl3_cd_sql};{wf_tl4_cd_sql};{ques_id_sql}"
        )
        sql_statements.append((key_identifier, sql, f"Failed to insert TiRawWaferQues record with identifier: {key_identifier}"))
    return sql_statements


# DAG definition
dag_ti_raw_wafer_ques = DAG(
    "ETL_PQO_TI_RAW_WAFER_QUES",
    default_args=default_args,
    description="ETL job for pushing TiRawWaferQues data from PDM API to Oracle (Full Load with Atomic Transaction)",
    tags=["pqo_batch", "ccpd", "etl", "pdm_api"],
    schedule="45 1-23/2 * * *",
    catchup=False,
    max_active_runs=1,
)


with dag_ti_raw_wafer_ques:
    etl_full_load_task = PythonOperator(
        task_id="etl_ti_raw_wafer_ques_full_load",
        python_callable=pdm_api_full_load_task,
        op_kwargs={
            "api_endpoint": "/TI_GUI_MB/rest/TiWebService/getTiRawWaferQueByTl4CdAndStatus", # As per Java Reader
            "table_name": "TI_RAW_WAFER_QUES",
            "transform_func": _process_ti_raw_wafer_ques_data,
            "generate_sql_func": _generate_ti_raw_wafer_ques_insert_sql,
            "pdm_api_conn_id": "pdm_api_conn",
            "oracle_conn_id": "pqo_db",
        },
        retries=5,
        retry_delay=timedelta(seconds=10),
        retry_exponential_backoff=True,
        max_retry_delay=timedelta(minutes=5),
        dag=dag_ti_raw_wafer_ques,
    )