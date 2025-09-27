# -*- coding: utf-8 -*-
from __future__ import annotations
from typing import Dict, Any, Tuple
from sqlalchemy import text
from sqlalchemy.engine import Connection

ALLOWED: Dict[str, Tuple[str, str, str, bool]] = {
    # fines (дельты из кумулятивов)
    "violations_delta": ("analytics_private.fines_daily_delta", "dt", "violations", False),
    "rulings_delta":    ("analytics_private.fines_daily_delta", "dt", "rulings",    False),
    "imposed_delta":    ("analytics_private.fines_daily_delta", "dt", "imposed",    True),   # деньги
    "collected_delta":  ("analytics_private.fines_daily_delta", "dt", "collected",  True),   # деньги
    # evac
    "evacuations":      ("analytics_private.evac_daily",        "dt", "evacuations", False),
    "trips":            ("analytics_private.evac_daily",        "dt", "trips",       False),
    "impound_income":   ("analytics_private.evac_daily",        "dt", "impound_income", True),  # деньги
    # mvd
    "injured_accidents":("analytics_private.mvd_accidents", "date_from", "injured_accidents", False),
    "fatalities":       ("analytics_private.mvd_accidents", "date_from", "fatalities",        False),
    "injured_persons":  ("analytics_private.mvd_accidents", "date_from", "injured_persons",   False),
}

def compare_periods(
    conn: Connection,
    metric: str,
    period_a_start,
    period_a_end,
    period_b_start,
    period_b_end,
    is_admin: bool = False,
) -> Dict[str, Any]:
    """
    Универсальное сравнение периодов по метрике (A vs B).
    Гостям запрещены денежные метрики.
    """
    if metric not in ALLOWED:
        raise ValueError(f"metric '{metric}' is not allowed")

    table, date_col, value_col, is_money = ALLOWED[metric]
    if is_money and not is_admin:
        raise PermissionError("money metrics are not available for guests")

    def _sum_range(f, t) -> int:
        if table.endswith("mvd_accidents"):
            sql = f"SELECT COALESCE(SUM({value_col}),0) s FROM {table} WHERE date_from >= :f AND date_to <= :t"
        else:
            sql = f"SELECT COALESCE(SUM({value_col}),0) s FROM {table} WHERE {date_col} BETWEEN :f AND :t"
        return int(conn.execute(text(sql), {"f": f, "t": t}).scalar() or 0)

    s_a = _sum_range(period_a_start, period_a_end)
    s_b = _sum_range(period_b_start, period_b_end)

    # Средние — только для дневных табличных рядов (не МВД)
    if table.endswith("mvd_accidents"):
        avg_a = avg_b = None
    else:
        n_a = (period_a_end - period_a_start).days + 1
        n_b = (period_b_end - period_b_start).days + 1
        avg_a = (s_a / n_a) if n_a else None
        avg_b = (s_b / n_b) if n_b else None

    diff_abs = s_a - s_b
    diff_rel = (diff_abs / s_b) if s_b else None

    return {
        "metric": metric,
        "period_a": {"from": str(period_a_start), "to": str(period_a_end), "sum": s_a, "avg": avg_a},
        "period_b": {"from": str(period_b_start), "to": str(period_b_end), "sum": s_b, "avg": avg_b},
        "diff": {"abs": diff_abs, "rel": diff_rel},
        "meta": {"admin": is_admin},
    }
