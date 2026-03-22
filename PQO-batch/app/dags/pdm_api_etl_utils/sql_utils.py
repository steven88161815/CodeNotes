import pandas as pd
from datetime import datetime

# Helper function: Converts Python values to SQL string literals or 'NULL'
def to_sql_value(val) -> str:
    if pd.isna(val) or val is None:
        return 'NULL'
    
    if isinstance(val, datetime):
        # Format datetime objects for Oracle's TO_DATE function
        return f"TO_DATE('{val.strftime('%Y-%m-%d %H:%M:%S')}', 'YYYY-MM-DD HH24:MI:SS')"
    
    if isinstance(val, (int, float)):
        return str(val)
    
    # Escape single quotes for SQL string literals
    escaped_val_str = str(val).replace("'", "''")
    
    return f"'{escaped_val_str}'"