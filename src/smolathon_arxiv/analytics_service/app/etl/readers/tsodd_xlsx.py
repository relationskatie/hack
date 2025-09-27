from pathlib import Path
import pandas as pd
from io import BytesIO
import pandas as pd
from pandas.io.excel import ExcelFile




def _coerce_date_series(s):
    return pd.to_datetime(s, dayfirst=True, errors="coerce").dt.date

def load_fines_from_xlsx(xlsx_path: Path) -> pd.DataFrame:
    dfs = []
    for sheet in ["Штрафы 2024", "Штрафы 2025"]:
        df = pd.read_excel(xlsx_path, sheet_name=sheet)
        cols = {c.lower().strip(): c for c in df.columns}
        rename = {}
        for c in df.columns:
            lc = c.lower()
            if "дата" in lc: rename[c] = "dt"
            elif "зафикс" in lc: rename[c] = "violations_cum"
            elif "вынес"  in lc: rename[c] = "rulings_cum"
            elif "налож"  in lc: rename[c] = "imposed_cum"
            elif "взыск"  in lc: rename[c] = "collected_cum"
        df = df.rename(columns=rename)[list(rename.values())]
        df["dt"] = _coerce_date_series(df["dt"])
        df = df.dropna(subset=["dt"]).sort_values("dt")
        for c in ["violations_cum","rulings_cum","imposed_cum","collected_cum"]:
            df[c] = pd.to_numeric(df[c], errors="coerce").fillna(0).astype("int64")
        dfs.append(df)
    out = pd.concat(dfs, ignore_index=True).drop_duplicates(subset=["dt"])
    return out

def load_evac_from_xlsx(xlsx_path: Path) -> pd.DataFrame:
    dfs = []
    for sheet in ["Эвакуация 2024", "Эвакуация 2025"]:
        df = pd.read_excel(xlsx_path, sheet_name=sheet)
        rename = {}
        for c in df.columns:
            lc = str(c).lower()
            if "дата" in lc: rename[c] = "dt"
            elif "на линии" in lc or "линии" in lc: rename[c] = "trucks_on_line"
            elif "выезд" in lc: rename[c] = "trips"
            elif "эвакуац" in lc: rename[c] = "evacuations"
            elif "поступ" in lc or "штрафстоян" in lc: rename[c] = "impound_income"
        df = df.rename(columns=rename)[list(rename.values())]
        df["dt"] = _coerce_date_series(df["dt"])
        df = df.dropna(subset=["dt"]).sort_values("dt")
        for c in ["trucks_on_line","trips","evacuations","impound_income"]:
            df[c] = pd.to_numeric(df[c], errors="coerce").fillna(0).astype("int64")
        dfs.append(df)
    out = pd.concat(dfs, ignore_index=True).drop_duplicates(subset=["dt"])
    return out


def load_fines_from_pdexel(excel_file: ExcelFile) -> pd.DataFrame:
    dfs = []
    for sheet in ["Штрафы 2024", "Штрафы 2025"]:
        if sheet not in excel_file.sheet_names:
            continue  # пропустить, если лист отсутствует
        df = pd.read_excel(excel_file, sheet_name=sheet)
        rename = {}
        for c in df.columns:
            lc = str(c).lower()
            if "дата" in lc:
                rename[c] = "dt"
            elif "зафикс" in lc:
                rename[c] = "violations_cum"
            elif "вынес" in lc:
                rename[c] = "rulings_cum"
            elif "налож" in lc:
                rename[c] = "imposed_cum"
            elif "взыск" in lc:
                rename[c] = "collected_cum"
        # Убедимся, что хотя бы один столбец переименован
        if not rename:
            continue
        df = df.rename(columns=rename)[list(rename.values())]
        df["dt"] = _coerce_date_series(df["dt"])
        df = df.dropna(subset=["dt"]).sort_values("dt")
        for c in ["violations_cum", "rulings_cum", "imposed_cum", "collected_cum"]:
            if c in df.columns:
                df[c] = pd.to_numeric(df[c], errors="coerce").fillna(0).astype("int64")
        dfs.append(df)
    if not dfs:
        return pd.DataFrame()  # пустой DataFrame, если ничего не найдено
    out = pd.concat(dfs, ignore_index=True).drop_duplicates(subset=["dt"])
    return out


def load_evac_from_pdexel(excel_file: ExcelFile) -> pd.DataFrame:
    dfs = []
    for sheet in ["Эвакуация 2024", "Эвакуация 2025"]:
        if sheet not in excel_file.sheet_names:
            continue
        df = pd.read_excel(excel_file, sheet_name=sheet)
        rename = {}
        for c in df.columns:
            lc = str(c).lower()
            if "дата" in lc:
                rename[c] = "dt"
            elif "на линии" in lc or "линии" in lc:
                rename[c] = "trucks_on_line"
            elif "выезд" in lc:
                rename[c] = "trips"
            elif "эвакуац" in lc:
                rename[c] = "evacuations"
            elif "поступ" in lc or "штрафстоян" in lc:
                rename[c] = "impound_income"
        if not rename:
            continue
        df = df.rename(columns=rename)[list(rename.values())]
        df["dt"] = _coerce_date_series(df["dt"])
        df = df.dropna(subset=["dt"]).sort_values("dt")
        for c in ["trucks_on_line", "trips", "evacuations", "impound_income"]:
            if c in df.columns:
                df[c] = pd.to_numeric(df[c], errors="coerce").fillna(0).astype("int64")
        dfs.append(df)
    if not dfs:
        return pd.DataFrame()
    out = pd.concat(dfs, ignore_index=True).drop_duplicates(subset=["dt"])
    return out



def parse_fines_df(content) -> pd.DataFrame:
    return load_fines_from_pdexel(content)  # BytesIO работает как файл

def parse_evac_df(content) -> pd.DataFrame:
    return load_evac_from_pdexel(content)
