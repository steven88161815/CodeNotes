"""
utils for dags function
"""
from typing import Any, Union, List, Tuple, Dict
from contextlib import closing
import re
from airflow.providers.oracle.hooks.oracle import OracleHook
from app.dags.schemas import PqoSysEtlCtrlLog, PqoSysEtlPrefLog
import pandas as pd
import os
from airflow.models import Variable

path: str = Variable.get("out_file_loc", "/shared/app/output/")


def get_data_from_oracle(**kwargs) -> Union[pd.DataFrame, List[Tuple]]:
    oracle_hook = OracleHook(oracle_conn_id=kwargs["oracle_conn_id"])
    if "result_type" in kwargs and kwargs["result_type"] == "pandas":
        return oracle_hook.get_pandas_df(sql=kwargs["sql"])
    return oracle_hook.get_records(sql=kwargs["sql"])


def analyze_bash_output(**kwargs) -> Union[str, None]:
    task_instance = kwargs["ti"]
    source_task = kwargs.get("source_task", "call_ora_db")
    query_result: List[tuple] = task_instance.xcom_pull(
        task_ids=source_task, key="return_value"
    )
    if len(query_result) > 0:
        return "email_with_error_record"
    if "target_branch" in kwargs:
        return kwargs["target_branch"]
    return None


def insert_update_record(
    oracle_conn_id: str,
    sql_list: List[Tuple[str, str, str]],
    etl_name: str,
    target_table: str,
) -> int:
    oracle_hook = OracleHook(oracle_conn_id=oracle_conn_id)
    failed_count: int = 0
    with closing(oracle_hook.get_conn()) as conn:
        with closing(conn.cursor()) as cursor:
            for keys, sql, error_desc in sql_list:
                try:
                    cursor.execute(sql)
                except Exception as error:
                    failed_count += 1
                    ctrl_row = PqoSysEtlCtrlLog(
                        keys=keys,
                        etl_name=etl_name,
                        target_table=target_table,
                        sql_code=get_sql_code(str(error)),
                        desc=error_desc,
                    )
                    pqo_sys_etl_ctrl_log(oracle_conn_id, ctrl_row)
                    print(str(error), sql)
            conn.commit()
    return failed_count


def execucte_batch_sql_by_epoch(
    oracle_conn_id: str,
    sql_list: List[Tuple[str, str, str]],
    etl_name: str,
    target_table: str,
    conn,
) -> int:
    failed_count: int = 0
    with closing(conn.cursor()) as cursor:
        for keys, sql, error_desc in sql_list:
            try:
                cursor.execute(sql)
            except Exception as error:
                failed_count += 1
                ctrl_row = PqoSysEtlCtrlLog(
                    keys=keys,
                    etl_name=etl_name,
                    target_table=target_table,
                    sql_code=get_sql_code(str(error)),
                    desc=error_desc,
                )
                pqo_sys_etl_ctrl_log(oracle_conn_id, ctrl_row)
                print(str(error), sql)
        if failed_count > 0:
            conn.rollback()
        else:
            conn.commit()
    return failed_count


def execute_sql_batch_without_commit(
    conn,
    oracle_conn_id: str,
    sql_statements_with_meta: List[Tuple[str, str, str]], # (keys, sql, error_desc)
    etl_name: str,
    target_table: str,
) -> Dict[str, Any]:
    """
    Executes a batch of SQL statements, logs errors for individual failures,
    but does not perform commit or rollback.
    The caller is responsible for deciding whether to commit or rollback the
    entire transaction based on the returned results.
    This function assumes that the 'keys' passed in are already suitable for logging
    (e.g., uniqueness has been handled by the caller).

    Args:
        conn: The external database connection object.
        oracle_conn_id: Airflow Oracle connection ID, used for error logging.
        sql_statements_with_meta: A list containing (record_key, sql_statement, error_description).
        etl_name: The ETL task name, used for logging.
        target_table: The target table name, used for logging.

    Returns:
        A dictionary containing information such as 'total_processed', 'failed_count',
        and 'failed_statements_details'.
    """
    failed_count: int = 0
    total_processed: int = 0
    failed_statements_details: List[Dict[str, str]] = []

    with closing(conn.cursor()) as cursor:
        for keys, sql_statement, error_desc in sql_statements_with_meta:
            total_processed += 1
            try:
                cursor.execute(sql_statement)
            except Exception as sql_error:
                failed_count += 1
                ctrl_row = PqoSysEtlCtrlLog(
                    keys=keys,
                    etl_name=etl_name,
                    target_table=target_table,
                    sql_code=get_sql_code(str(sql_error)),
                    desc=f"{error_desc}: {sql_error}",
                )
                pqo_sys_etl_ctrl_log(oracle_conn_id, ctrl_row)
                
                print(f"SQL execution failed: {str(sql_error)}, SQL: {sql_statement}")

    return {
        "total_processed": total_processed,
        "failed_count": failed_count
    }


def diff_two_dataframe(
    dataframe1: pd.DataFrame, dataframe2: pd.DataFrame
) -> pd.DataFrame:
    if set(dataframe1.columns) != set(dataframe2.columns):
        raise ValueError(
            f"dataframe column not align {str(set(dataframe1.columns).difference(set(dataframe2.columns)))}"
        )
    _check_datatype_is_same(dataframe1, dataframe2)
    return pd.concat([dataframe1, dataframe2]).drop_duplicates(keep=False)


def _check_datatype_is_same(
    dataframe1: pd.DataFrame, dataframe2: pd.DataFrame
) -> None:
    error_string = ""
    for column, type1, type2 in zip(
        dataframe1.columns,
        dataframe1.sort_index(axis=1).dtypes,
        dataframe2.sort_index(axis=1).dtypes,
    ):
        if type1 != type2:
            error_string += (
                f"column:{column} df1 type is {type1}; df2 type is {type2}\n"
            )
    if len(error_string) > 0:
        raise TypeError(error_string)


def pqo_sys_etl_ctrl_log(
    oracle_conn_id: str, ctrl_obj: PqoSysEtlCtrlLog
) -> None:
    sql = f"""
    insert into pqo_sys_etl_ctrl_log
        (prog_name, record_key_name, create_dt, target_table_name, sys_err_no, etl_msg_desc, etl_status_cd)
    values
        ('{ctrl_obj.etl_name}',
        '{ctrl_obj.keys}',
        sysdate,
        '{ctrl_obj.target_table}',
        {ctrl_obj.sql_code},
        '{ctrl_obj.desc}',
        'F'
        )
    """
    
    oracle_hook = OracleHook(oracle_conn_id=oracle_conn_id)
    with closing(oracle_hook.get_conn()) as conn:
        with closing(conn.cursor()) as cursor:
            cursor.execute(sql)
            conn.commit()


def sql_list_to_csv(**kwargs) -> None:
    task_instance = kwargs["ti"]
    if "csv_file_name" not in kwargs:
        raise ValueError("Missing csv_file_name")
    
    if "source_task" in kwargs:
        source_task = kwargs["source_task"]
        query_result: List[tuple] = task_instance.xcom_pull(
            task_ids=source_task, key="return_value"
        )
        
        df = pd.DataFrame.from_records(query_result)
        os.makedirs(
            path,
            exist_ok=True,
            mode=0o777,
        )
        df.to_csv(path + f"{kwargs['csv_file_name']}.csv")
    else:
        raise ValueError("missing source_task parameter")


def pqo_sys_etl_perf_log(
    oracle_conn_id: str, pref_obj: PqoSysEtlPrefLog
) -> None:
    sql = f"""
    insert into pqo_sys_etl_perf_log
        (prog_name, start_dt, end_dt, total_cnt, fail_cnt, etl_status_name, update_dt)
    values
        ('{pref_obj.etl_name}',
        to_date('{pref_obj.start_time.strftime("%Y-%m-%d %H:%M:%S")}','yyyy-mm-dd hh24:mi:ss'),
        sysdate,
        {pref_obj.total_count},
        {pref_obj.fail_count},
        'FINISH',
        sysdate
        )
    """
    oracle_hook = OracleHook(oracle_conn_id=oracle_conn_id)
    with closing(oracle_hook.get_conn()) as conn:
        with closing(conn.cursor()) as cursor:
            cursor.execute(sql)
            conn.commit()


def get_sql_code(sql_error: str) -> str:
    code_match = re.search("^ORA-(\\d+):.+", str(sql_error))
    assert code_match is not None
    return code_match.group(1)


def multiple_email_send_test(
    procedure_list, procedure_mailsubject_map, **kwargs
):
    from airflow.utils.email import send_email
    
    db_service = kwargs["dbservice"]
    
    execute_sql: str = f"""
        select record_key_name,prog_name,create_dt
        from pqo_sys_etl_ctrl_log
        where prog_name in ({','.join(f"'{procedure}'" for procedure in procedure_list)})
        """
    
    result: pd.DataFrame = get_data_from_oracle(
        oracle_conn_id=kwargs["oracle_conn_id"],
        result_type="pandas",
        sql=execute_sql,
    )
    
    email_list = kwargs["email_reciver"]
    for prog_name in set(result["PROG_NAME"]):
        if len(result[result["PROG_NAME"] == prog_name]) > 0:
            os.makedirs(
                path,
                exist_ok=True,
                mode=0o777,
            )
            result[result["PROG_NAME"] == prog_name].to_csv(
                path + f"{prog_name}.csv"
            )
            send_email(
                to=str(email_list),
                subject=f"""
                [{db_service}]
                 {procedure_mailsubject_map.get(
                    prog_name, "Not found subject at map"
                )}""",
                html_content="Please check attachment for details",
                files=[f"{path}{prog_name}.csv"],
            )


def get_record_count_number(source_task, **kwargs) -> None:
    """analyse record count to decide email format"""
    import re  # # airflow coding style
    
    task_instance = kwargs["ti"]
    total_count: str = task_instance.xcom_pull(task_ids=source_task)
    
    try:
        record_count: int = int(
            re.search(r"Total Record Count = (\d*)", total_count).group(1)
        )
    except AttributeError as error:
        raise ValueError(
            "privious output didn't have the pattern Total Record Count = XXX"
        ) from error
    
    task_instance.xcom_push(key="record_count", value=record_count)


def JavaApp_branch(source_task, pattern, **kwargs) -> str:
    """analyse record acount to decide email format"""
    import re  # # airflow coding style
    
    task_instance = kwargs["ti"]
    total_count: str = task_instance.xcom_pull(task_ids=source_task)
    try:
        record_count: int = int(re.search(pattern, total_count).group(1))
    except AttributeError as error:
        raise ValueError(
            f"privious output didn't have the pattern {pattern}"
        ) from error
    
    task_instance.xcom_push(key="record_count", value=record_count)
    task_instance.xcom_push(
        key="email_content", value=total_count.replace("|", "</br>")
    )
    if record_count > 0:
        return "email_with_result"
    return "email_with_empty_result"


def sql_to_excel_branch(
    record_count: int, normal_branch: str, error_branch: str
):
    if int(record_count) == 0:
        return normal_branch
    else:
        return error_branch