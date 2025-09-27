# -*- coding: utf-8 -*-
from __future__ import annotations
from typing import Dict, Any, List
from dataclasses import dataclass
from sqlalchemy.engine import Connection
from .common import group_clause, exec_rows, forbid_money_if_guest

@dataclass
class SeriesPoint:
    dt: str
    value: int

def get_fines_timeseries(
    conn: Connection,
    date_from,
    date_to,
    grouping: str = "day",
    is_admin: bool = False,
) -> Dict[str, Any]:
    """
    Штрафы: берём дельты из analytics_private.fines_daily_delta,
    агрегируем по выбранной группировке, для гостей скрываем денежные поля.
    """
    bucket = group_clause(grouping, "dt")
    sql = f"""
        SELECT {bucket} AS bucket,
               SUM(violations) AS violations_delta,
               SUM(rulings)    AS rulings_delta,
               SUM(imposed)    AS imposed_delta,
               SUM(collected)  AS collected_delta
        FROM analytics_private.fines_daily_delta
        WHERE dt BETWEEN :frm AND :to
        GROUP BY bucket
        ORDER BY bucket
    """
    rows = exec_rows(conn, sql, {"frm": date_from, "to": date_to})

    out_series: Dict[str, List[dict]] = {
        "violations_delta": [SeriesPoint(str(r["bucket"]), int(r["violations_delta"] or 0)).__dict__ for r in rows],
        "rulings_delta":    [SeriesPoint(str(r["bucket"]), int(r["rulings_delta"]    or 0)).__dict__ for r in rows],
        "imposed_delta":    [SeriesPoint(str(r["bucket"]), int(r["imposed_delta"]    or 0)).__dict__ for r in rows],
        "collected_delta":  [SeriesPoint(str(r["bucket"]), int(r["collected_delta"]  or 0)).__dict__ for r in rows],
    }
    visible_keys = forbid_money_if_guest(is_admin, list(out_series.keys()))
    series = {k: out_series[k] for k in visible_keys}

    sums = {k: int(sum(p["value"] for p in v)) for k, v in series.items()}
    aggregates = {"sum": sums}

    kpi = None
    if is_admin:
        imposed_sum   = int(sum(p["value"] for p in out_series["imposed_delta"]))
        collected_sum = int(sum(p["value"] for p in out_series["collected_delta"]))
        kpi = {"collection_rate": (collected_sum / imposed_sum) if imposed_sum else None}

    return {"series": series, "aggregates": aggregates, "kpi": kpi, "meta": {"group_by": grouping, "admin": is_admin}}
