# -*- coding: utf-8 -*-
from __future__ import annotations
from typing import Dict, Any
import numpy as np
from sqlalchemy.engine import Connection
from .common import group_clause, exec_rows, forbid_money_if_guest

def get_evac_timeseries(
    conn: Connection,
    date_from,
    date_to,
    grouping: str = "day",
    is_admin: bool = False,
) -> Dict[str, Any]:
    """
    Эвакуации: агрегируем по dt; для гостей скрываем impound_income.
    """
    bucket = group_clause(grouping, "dt")
    sql = f"""
        SELECT {bucket} AS bucket,
               SUM(trucks_on_line) AS trucks_on_line,
               SUM(trips)          AS trips,
               SUM(evacuations)    AS evacuations,
               SUM(impound_income) AS impound_income
        FROM analytics_private.evac_daily
        WHERE dt BETWEEN :frm AND :to
        GROUP BY bucket
        ORDER BY bucket
    """
    rows = exec_rows(conn, sql, {"frm": date_from, "to": date_to})

    series_all = {
        "trucks_on_line": [{"dt": str(r["bucket"]), "value": int(r["trucks_on_line"] or 0)} for r in rows],
        "trips":          [{"dt": str(r["bucket"]), "value": int(r["trips"]          or 0)} for r in rows],
        "evacuations":    [{"dt": str(r["bucket"]), "value": int(r["evacuations"]    or 0)} for r in rows],
        "impound_income": [{"dt": str(r["bucket"]), "value": int(r["impound_income"] or 0)} for r in rows],
    }
    visible_keys = forbid_money_if_guest(is_admin, list(series_all.keys()))
    series = {k: series_all[k] for k in visible_keys}

    sums = {}
    if "trips" in series:        sums["trips"]        = int(sum(p["value"] for p in series["trips"]))
    if "evacuations" in series:  sums["evacuations"]  = int(sum(p["value"] for p in series["evacuations"]))
    if "impound_income" in series: sums["impound_income"] = int(sum(p["value"] for p in series["impound_income"]))

    trucks_vals = [p["value"] for p in series.get("trucks_on_line", [])]
    avg_trucks = float(np.mean(trucks_vals)) if trucks_vals else 0.0

    aggregates = {"sum": sums, "avg": {"trucks_on_line": round(avg_trucks, 2)}}
    return {"series": series, "aggregates": aggregates, "meta": {"group_by": grouping, "admin": is_admin}}
