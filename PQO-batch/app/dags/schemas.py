"""
schemas for pqo control and performance log
"""

from dataclasses import dataclass
from datetime import datetime

@dataclass
class PqoSysEtlCtrlLog:
    keys: str
    etl_name: str
    target_table: str
    sql_code: int
    desc: str

@dataclass
class PqoSysEtlPerfLog:
    etl_name: str
    total_count: str
    fail_count: str
    start_time: datetime