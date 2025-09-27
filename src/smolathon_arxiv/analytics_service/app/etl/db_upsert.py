from __future__ import annotations
import pandas as pd
from sqlalchemy import text
from typing import Dict, Any
from logging import getLogger
logger = getLogger(__name__)

def upsert_dataframes(conn, dfs: Dict[str, pd.DataFrame], mode: str = "replace") -> Dict[str, Any]:
    """
    dfs: {"fines_daily": df, "evac_daily": df, "mvd_accidents": df?}
    mode: "append" — upsert по ключам;
          "replace" — полная замена таблиц (truncate+insert).
    Возвращает summary по строкам и диапазонам.
    """
    summary = {"warnings": []}

    if mode not in ("append", "replace"):
        raise ValueError("mode must be 'append' or 'replace'")

    # если replace — очищаем целевые таблицы
    if mode == "replace":
        conn.exec_driver_sql('TRUNCATE analytics_private.fines_daily RESTART IDENTITY CASCADE;')
        conn.exec_driver_sql('TRUNCATE analytics_private.evac_daily RESTART IDENTITY CASCADE;')
        conn.exec_driver_sql('TRUNCATE analytics_private.mvd_accidents RESTART IDENTITY CASCADE;')

    # Обёртка на случай исключений — пытаемся аккуратно убрать временные таблицы в конце
    try:
        # --- fines_daily (ключ dt)
        if "fines_daily" in dfs and not dfs["fines_daily"].empty:
            df = dfs["fines_daily"].copy()
            df["dt"] = pd.to_datetime(df["dt"]).dt.date
            for col in ["violations_cum","rulings_cum","imposed_cum","collected_cum"]:
                df[col] = df[col].fillna(0).astype("int64")

            # staging (удаляем старый tmp если он есть, затем создаём как копию структуры без данных)
            conn.exec_driver_sql("DROP TABLE IF EXISTS tmp_fines;")
            conn.exec_driver_sql("CREATE TEMP TABLE tmp_fines AS TABLE analytics_private.fines_daily WITH NO DATA;")
            df.to_sql("tmp_fines", conn, if_exists="append", index=False)
            # upsert
            conn.exec_driver_sql("""
            INSERT INTO analytics_private.fines_daily AS t (dt, violations_cum, rulings_cum, imposed_cum, collected_cum)
            SELECT dt, violations_cum, rulings_cum, imposed_cum, collected_cum FROM tmp_fines
            ON CONFLICT (dt) DO UPDATE
              SET violations_cum = EXCLUDED.violations_cum,
                  rulings_cum    = EXCLUDED.rulings_cum,
                  imposed_cum    = EXCLUDED.imposed_cum,
                  collected_cum  = EXCLUDED.collected_cum;
            """)
            rng = conn.exec_driver_sql("SELECT MIN(dt), MAX(dt), COUNT(*) FROM analytics_private.fines_daily").first()
            summary["fines_daily"] = {"range": [str(rng[0]), str(rng[1])], "rows": int(rng[2])}

        # --- evac_daily (ключ dt)
        if "evac_daily" in dfs and not dfs["evac_daily"].empty:
            df = dfs["evac_daily"].copy()
            df["dt"] = pd.to_datetime(df["dt"]).dt.date
            for col in ["trucks_on_line","trips","evacuations","impound_income"]:
                df[col] = df[col].fillna(0).astype("int64")

            conn.exec_driver_sql("DROP TABLE IF EXISTS tmp_evac;")
            conn.exec_driver_sql("CREATE TEMP TABLE tmp_evac AS TABLE analytics_private.evac_daily WITH NO DATA;")
            df.to_sql("tmp_evac", conn, if_exists="append", index=False)
            conn.exec_driver_sql("""
            INSERT INTO analytics_private.evac_daily AS t (dt, trucks_on_line, trips, evacuations, impound_income)
            SELECT dt, trucks_on_line, trips, evacuations, impound_income FROM tmp_evac
            ON CONFLICT (dt) DO UPDATE
              SET trucks_on_line = EXCLUDED.trucks_on_line,
                  trips          = EXCLUDED.trips,
                  evacuations    = EXCLUDED.evacuations,
                  impound_income = EXCLUDED.impound_income;
            """)
            rng = conn.exec_driver_sql("SELECT MIN(dt), MAX(dt), COUNT(*) FROM analytics_private.evac_daily").first()
            summary["evac_daily"] = {"range": [str(rng[0]), str(rng[1])], "rows": int(rng[2])}

        # --- mvd_accidents (ключ period_key)
        if "mvd_accidents" in dfs and not dfs["mvd_accidents"].empty:
            df = dfs["mvd_accidents"].copy()
            # нормализуем period_key как начало месяца
            df["period_key"] = pd.to_datetime(df["date_from"]).dt.to_period("M").dt.to_timestamp().dt.date
            for col in ["injured_accidents","fatalities","injured_persons"]:
                df[col] = df[col].fillna(0).astype("int64")

            # staging — не создаём PK в staging
            conn.exec_driver_sql("DROP TABLE IF EXISTS tmp_mvd;")
            conn.exec_driver_sql("""
            CREATE TEMP TABLE tmp_mvd (
                period_key date,
                date_from date not null,
                date_to date not null,
                injured_accidents int not null,
                fatalities int not null,
                injured_persons int not null
            );
            """)

            df2 = df[["period_key","date_from","date_to","injured_accidents","fatalities","injured_persons"]].copy()
            df2["date_from"] = pd.to_datetime(df2["date_from"]).dt.date
            df2["date_to"]   = pd.to_datetime(df2["date_to"]).dt.date

            # удаляем дубликаты по period_key — оставляем последнюю запись (по date_to)
            before = len(df2)
            df2 = df2.sort_values("date_to").drop_duplicates(subset=["period_key"], keep="last").reset_index(drop=True)
            after = len(df2)
            removed = before - after
            if removed > 0:
                try:
                    logger.debug("mvd: rows before dedupe=%s, after=%s", before, after)
                except Exception:
                    pass
                summary["warnings"].append(f"mvd_accidents: removed {removed} duplicate rows by period_key (kept last by date_to)")

            df2.to_sql("tmp_mvd", conn, if_exists="append", index=False)

            # NOTE: НЕ ПЫТАЕМСЯ СОЗДАВАТЬ УНИКАЛЬНЫЙ ИНДЕКС ЗДЕСЬ — это может упасть, если
            # в целевой таблице уже есть дубликаты. Создание индекса сделай отдельно
            # руками после очистки/миграции таблицы, либо оставь как есть.

            # upsert (если в целевой таблице есть уникальность по period_key, то ON CONFLICT сработает)
            conn.exec_driver_sql("""
            INSERT INTO analytics_private.mvd_accidents AS t
                (period_key, date_from, date_to, injured_accidents, fatalities, injured_persons)
            SELECT period_key, date_from, date_to, injured_accidents, fatalities, injured_persons
            FROM tmp_mvd
            ON CONFLICT (period_key) DO UPDATE
              SET date_from = EXCLUDED.date_from,
                  date_to   = EXCLUDED.date_to,
                  injured_accidents = EXCLUDED.injured_accidents,
                  fatalities        = EXCLUDED.fatalities,
                  injured_persons   = EXCLUDED.injured_persons;
            """)
            rng = conn.exec_driver_sql("SELECT MIN(date_from), MAX(date_to), COUNT(*) FROM analytics_private.mvd_accidents").first()
            summary["mvd_accidents"] = {"range": [str(rng[0]), str(rng[1])], "rows": int(rng[2])}

        return summary

    finally:
        # try to drop temp tables if they still exist — не критично, но чисто
        try:
            conn.exec_driver_sql("DROP TABLE IF EXISTS tmp_fines;")
            conn.exec_driver_sql("DROP TABLE IF EXISTS tmp_evac;")
            conn.exec_driver_sql("DROP TABLE IF EXISTS tmp_mvd;")
        except Exception:
            pass
