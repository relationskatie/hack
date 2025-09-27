from pathlib import Path
import pandas as pd
from io import BytesIO


def _parse_period_to_range(period: str):
    if not isinstance(period, str):
        return None, None
    p = period.replace(" ", "")
    if "-" in p:
        a, b = p.split("-")
        df = pd.to_datetime(f"01.{a}", format="%d.%m.%y", errors="coerce")
        dt = pd.to_datetime(f"01.{b}", format="%d.%m.%y", errors="coerce")
        if pd.isna(df) or pd.isna(dt):
            return None, None
        dt = (dt + pd.offsets.MonthEnd(0)).date()
        return df.date(), dt
    else:
        d = pd.to_datetime(f"01.{p}", format="%d.%m.%y", errors="coerce")
        if pd.isna(d):
            return None, None
        return d.date(), (d + pd.offsets.MonthEnd(0)).date()

def load_mvd_from_csv(csv_path: Path) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    df.columns = [str(c).strip().lower() for c in df.columns]
    rename = {}
    for c in df.columns:
        if "период" in c: rename[c] = "period_raw"
        elif "дтп" in c and "пострадавш" in c: rename[c] = "injured_accidents"
        elif "погибш" in c: rename[c] = "fatalities"
        elif "ранен" in c: rename[c] = "injured_persons"
    df = df.rename(columns=rename)[list(rename.values())]
    ranges = df["period_raw"].apply(_parse_period_to_range)
    df["date_from"] = [r[0] for r in ranges]
    df["date_to"]   = [r[1] for r in ranges]
    for c in ["injured_accidents","fatalities","injured_persons"]:
        df[c] = pd.to_numeric(df[c], errors="coerce").fillna(0).astype("int64")
    df = df.dropna(subset=["date_from","date_to"])
    return df

def load_mvd_from_byte_csv(df: pd.DataFrame) -> pd.DataFrame:
    df.columns = [str(c).strip().lower() for c in df.columns]
    rename = {}
    for c in df.columns:
        if "период" in c: rename[c] = "period_raw"
        elif "дтп" in c and "пострадавш" in c: rename[c] = "injured_accidents"
        elif "погибш" in c: rename[c] = "fatalities"
        elif "ранен" in c: rename[c] = "injured_persons"
    df = df.rename(columns=rename)[list(rename.values())]
    ranges = df["period_raw"].apply(_parse_period_to_range)
    df["date_from"] = [r[0] for r in ranges]
    df["date_to"]   = [r[1] for r in ranges]
    for c in ["injured_accidents","fatalities","injured_persons"]:
        df[c] = pd.to_numeric(df[c], errors="coerce").fillna(0).astype("int64")
    df = df.dropna(subset=["date_from","date_to"])
    return df

