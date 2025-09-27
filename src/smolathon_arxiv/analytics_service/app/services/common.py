# -*- coding: utf-8 -*-
from __future__ import annotations
from typing import Dict, Any, List, Tuple
from sqlalchemy import text
from sqlalchemy.engine import Connection

def group_clause(grouping: str, col: str = "dt") -> str:
    """
    day    -> dt
    week   -> date_trunc('week', dt)::date
    month  -> date_trunc('month', dt)::date
    """
    g = (grouping or "day").lower()
    if g == "week":
        return f"date_trunc('week', {col})::date"
    if g == "month":
        return f"date_trunc('month', {col})::date"
    return col  # day (по умолчанию)

def forbid_money_if_guest(is_admin: bool, fields: List[str]) -> List[str]:
    money_cols = {"imposed_delta", "collected_delta", "impound_income"}
    if is_admin:
        return fields
    return [f for f in fields if f not in money_cols]

def exec_rows(conn: Connection, sql: str, params: Dict[str, Any]):
    """Выполняет SQL и возвращает list(mapping)."""
    return list(conn.execute(text(sql), params).mappings())
