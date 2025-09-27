from pathlib import Path
from sqlalchemy import create_engine, text
import pandas as pd
from typing import Dict, Any

from .readers.tsodd_xlsx import load_fines_from_xlsx, load_evac_from_xlsx
from .readers.mvd_csv import load_mvd_from_csv
from .validators import ensure_monotonic_cumulative

def run_import(pg_dsn: str, base_path: str = "data"):
    base = Path(base_path)
    xlsx = base / "ЦОДД.xlsx"
    csv  = base / "mvd_data.csv"
    if not xlsx.exists():
        raise FileNotFoundError(f"Нет файла: {xlsx}")
    if not csv.exists():
        raise FileNotFoundError(f"Нет файла: {csv}")

    fines = load_fines_from_xlsx(xlsx)
    evac = load_evac_from_xlsx(xlsx)
    mvd = load_mvd_from_csv(csv)

    warnings = ensure_monotonic_cumulative(fines, ["violations_cum","rulings_cum","imposed_cum","collected_cum"])

    eng = create_engine(pg_dsn, future=True)
    with eng.begin() as con:
        con.execute(text("TRUNCATE analytics_private.fines_daily RESTART IDENTITY"))
        con.execute(text("TRUNCATE analytics_private.evac_daily RESTART IDENTITY"))
        con.execute(text("TRUNCATE analytics_private.mvd_accidents RESTART IDENTITY"))
        fines.to_sql("fines_daily", con, schema="analytics_private", if_exists="append", index=False)
        evac.to_sql("evac_daily",  con, schema="analytics_private", if_exists="append", index=False)
        mvd.to_sql("mvd_accidents", con, schema="analytics_private", if_exists="append", index=False)

    return {
        "fines_daily": {"rows": int(len(fines)), "range": [str(fines.dt.min()), str(fines.dt.max())]},
        "evac_daily":  {"rows": int(len(evac)),  "range": [str(evac.dt.min()),  str(evac.dt.max())]},
        "mvd_accidents":{"rows": int(len(mvd)),  "range": [str(mvd.date_from.min()), str(mvd.date_to.max())]},
        "warnings": warnings
    }

def run_byte_import(pg_dsn: str, dfs: Dict[str, pd.DataFrame]) -> Dict[str, Any]:
    """
    Replace-mode import from provided dataframes.
    dfs keys: optional "fines_daily", "evac_daily", "mvd_accidents".
    """
    print(f"Получен словарь dfs с ключами: {list(dfs.keys())}")
    for key, df in dfs.items():
        print(f"Ключ: {key}, тип: {type(df)}, пустой: {df is None or (hasattr(df, 'empty') and df.empty) if df is not None else True}")
        if df is not None and not df.empty:
            print(f"  Размер: {df.shape}, колонки: {list(df.columns)}")

    eng = create_engine(pg_dsn, future=True)
    warnings = []

    # Очищаем таблицы через connection
    with eng.begin() as con:
        con.execute(text("TRUNCATE analytics_private.fines_daily RESTART IDENTITY"))
        con.execute(text("TRUNCATE analytics_private.evac_daily RESTART IDENTITY"))
        con.execute(text("TRUNCATE analytics_private.mvd_accidents RESTART IDENTITY"))

        # Обработка fines_daily
        fines_df = dfs.get("fines_daily")
        print(f"fines_daily: {fines_df is not None and not fines_df.empty}")
        if fines_df is not None and not fines_df.empty:
            fines_df = fines_df.copy()
            if "dt" in fines_df.columns:
                fines_df["dt"] = pd.to_datetime(fines_df["dt"]).dt.date
            for col in ["violations_cum","rulings_cum","imposed_cum","collected_cum"]:
                if col in fines_df.columns:
                    fines_df[col] = pd.to_numeric(fines_df[col], errors="coerce").fillna(0).astype("int64")
            fines_summary = {"rows": int(len(fines_df)), "range": [str(fines_df.dt.min()), str(fines_df.dt.max())]}
            print(f"Вставляем fines_daily: {len(fines_df)} строк")
            fines_df.to_sql("fines_daily", con, schema="analytics_private", if_exists="append", index=False)
        else:
            fines_summary = {"rows": 0, "range": [None, None]}

        # Обработка evac_daily
        evac_df = dfs.get("evac_daily")
        print(f"evac_daily: {evac_df is not None and not evac_df.empty}")
        if evac_df is not None and not evac_df.empty:
            evac_df = evac_df.copy()
            if "dt" in evac_df.columns:
                evac_df["dt"] = pd.to_datetime(evac_df["dt"]).dt.date
            for col in ["trucks_on_line","trips","evacuations","impound_income"]:
                if col in evac_df.columns:
                    evac_df[col] = pd.to_numeric(evac_df[col], errors="coerce").fillna(0).astype("int64")
            evac_summary = {"rows": int(len(evac_df)), "range": [str(evac_df.dt.min()), str(evac_df.dt.max())]}
            print(f"Вставляем evac_daily: {len(evac_df)} строк")
            evac_df.to_sql("evac_daily", con, schema="analytics_private", if_exists="append", index=False)
        else:
            evac_summary = {"rows": 0, "range": [None, None]}

        # Обработка mvd_accidents
        mvd_df = dfs.get("mvd_accidents")
        print(f"mvd_accidents: {mvd_df is not None and not mvd_df.empty}")
        if mvd_df is not None and not mvd_df.empty:
            mvd_df = mvd_df.copy()
            if "date_from" in mvd_df.columns:
                mvd_df["date_from"] = pd.to_datetime(mvd_df["date_from"]).dt.date
            if "date_to" in mvd_df.columns:
                mvd_df["date_to"] = pd.to_datetime(mvd_df["date_to"]).dt.date
            for col in ["injured_accidents","fatalities","injured_persons"]:
                if col in mvd_df.columns:
                    mvd_df[col] = pd.to_numeric(mvd_df[col], errors="coerce").fillna(0).astype("int64")
            mvd_summary = {"rows": int(len(mvd_df)), "range": [str(mvd_df.date_from.min()), str(mvd_df.date_to.max())]}
            print(f"Вставляем mvd_accidents: {len(mvd_df)} строк")
            mvd_df.to_sql("mvd_accidents", con, schema="analytics_private", if_exists="append", index=False)
        else:
            mvd_summary = {"rows": 0, "range": [None, None]}

    return {
        "fines_daily": fines_summary,
        "evac_daily": evac_summary,
        "mvd_accidents": mvd_summary,
        "warnings": warnings
    }



def run_byte_import_upsert(pg_dsn: str, dfs: Dict[str, pd.DataFrame]) -> Dict[str, Any]:
    """
    Upsert-mode import: for each table, delete existing rows with the same 'dt' (or 'date_from'),
    then insert new rows. No full truncate — only targeted replacement.

    Expected keys in `dfs`:
        - "fines_daily"      → must have "dt"
        - "evac_daily"       → must have "dt"
        - "mvd_accidents"    → must have "date_from"
    """
    eng = create_engine(pg_dsn, future=True)
    result = {
        "fines_daily": {"rows_upserted": 0, "dates": []},
        "evac_daily": {"rows_upserted": 0, "dates": []},
        "mvd_accidents": {"rows_upserted": 0, "dates": []},
        "warnings": []
    }

    with eng.begin() as con:
        # ======================
        # 1. fines_daily
        # ======================
        fines_df = dfs.get("fines_daily")
        if fines_df is not None and not fines_df.empty:
            df = fines_df.copy()
            if "dt" not in df.columns:
                result["warnings"].append("fines_daily: column 'dt' missing, skipping")
            else:
                # Приведение типов
                df["dt"] = pd.to_datetime(df["dt"], errors="coerce").dt.date
                df = df.dropna(subset=["dt"])  # удаляем строки без даты

                for col in ["violations_cum", "rulings_cum", "imposed_cum", "collected_cum"]:
                    if col in df.columns:
                        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0).astype("int64")

                if not df.empty:
                    unique_dates = df["dt"].unique().tolist()
                    # Удаляем старые записи за эти даты
                    con.execute(
                        text("DELETE FROM analytics_private.fines_daily WHERE dt = ANY(:dates)"),
                        {"dates": unique_dates}
                    )
                    # Вставляем новые
                    df.to_sql("fines_daily", con, schema="analytics_private", if_exists="append", index=False)
                    result["fines_daily"] = {
                        "rows_upserted": len(df),
                        "dates": sorted([str(d) for d in unique_dates])
                    }

        # ======================
        # 2. evac_daily
        # ======================
        evac_df = dfs.get("evac_daily")
        if evac_df is not None and not evac_df.empty:
            df = evac_df.copy()
            if "dt" not in df.columns:
                result["warnings"].append("evac_daily: column 'dt' missing, skipping")
            else:
                df["dt"] = pd.to_datetime(df["dt"], errors="coerce").dt.date
                df = df.dropna(subset=["dt"])

                for col in ["trucks_on_line", "trips", "evacuations", "impound_income"]:
                    if col in df.columns:
                        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0).astype("int64")

                if not df.empty:
                    unique_dates = df["dt"].unique().tolist()
                    con.execute(
                        text("DELETE FROM analytics_private.evac_daily WHERE dt = ANY(:dates)"),
                        {"dates": unique_dates}
                    )
                    df.to_sql("evac_daily", con, schema="analytics_private", if_exists="append", index=False)
                    result["evac_daily"] = {
                        "rows_upserted": len(df),
                        "dates": sorted([str(d) for d in unique_dates])
                    }

        # ======================
        # 3. mvd_accidents
        # ======================
        mvd_df = dfs.get("mvd_accidents")
        if mvd_df is not None and not mvd_df.empty:
            df = mvd_df.copy()
            if "date_from" not in df.columns:
                result["warnings"].append("mvd_accidents: column 'date_from' missing, skipping")
            else:
                df["date_from"] = pd.to_datetime(df["date_from"], errors="coerce").dt.date
                df = df.dropna(subset=["date_from"])

                for col in ["injured_accidents", "fatalities", "injured_persons"]:
                    if col in df.columns:
                        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0).astype("int64")

                if not df.empty:
                    unique_dates = df["date_from"].unique().tolist()
                    con.execute(
                        text("DELETE FROM analytics_private.mvd_accidents WHERE date_from = ANY(:dates)"),
                        {"dates": unique_dates}
                    )
                    df.to_sql("mvd_accidents", con, schema="analytics_private", if_exists="append", index=False)
                    result["mvd_accidents"] = {
                        "rows_upserted": len(df),
                        "dates": sorted([str(d) for d in unique_dates])
                    }

    return result
