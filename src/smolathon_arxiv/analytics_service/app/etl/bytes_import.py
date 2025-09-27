# app/etl/bytes_import.py
from __future__ import annotations
from io import BytesIO
import pandas as pd
from datetime import datetime
from typing import Dict, Any, Tuple
from logging import getLogger
logger = getLogger(__name__)

from .readers.tsodd_xlsx import parse_fines_df, parse_evac_df  # вынесем «чистые» парсеры
from .readers.mvd_csv import load_mvd_from_csv, load_mvd_from_byte_csv

def read_excel_from_bytes(content: bytes) -> Dict[str, pd.DataFrame]:
    logger.debug(f"content go")
    """Возвращает словарь датафреймов для нужных листов."""
    # Если парсеры ожидают xlsx-путь, можно им дать BytesIO
    xls = pd.ExcelFile(BytesIO(content))
    logger.debug(f"{type(xls)}")
    fines = parse_fines_df(xls)  # вернёт df: dt, violations_cum, rulings_cum, imposed_cum, collected_cum
    evac  = parse_evac_df(xls)   # df: dt, trucks_on_line, trips, evacuations, impound_income
    logger.debug(f"fines, {type(fines)}")
    return {"fines_daily": fines, "evac_daily": evac}

def read_csv_from_bytes(content: bytes) -> pd.DataFrame:
    df = pd.read_csv(BytesIO(content), sep=None, engine="python", encoding="utf-8-sig")
    logger.debug(f"{df.head()}")
    return load_mvd_from_byte_csv(df)  # вернёт df: period_key, date_from, date_to, injured_accidents, fatalities, injured_persons
'''
def classify_and_parse(filename: str, content: bytes) -> Dict[str, pd.DataFrame]:
    name = filename.lower()
    logger.debug(f"{name}")
    if name.endswith(".xlsx") or name.endswith(".xls"):
        return read_excel_from_bytes(content)  # dict из двух dfs
    elif name.endswith(".csv"):
        mvd = read_csv_from_bytes(content)
        return {"mvd_accidents": mvd}
    
    else:
        raise ValueError(f"Unsupported file type: {filename}")
'''


# Сигнатуры файлов
XLS_SIGNATURE = b"\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1"
XLSX_SIGNATURE = b"PK\x03\x04"  # ZIP-based (xlsx, docx, etc.)

def _is_xlsx(content: bytes) -> bool:
    return content.startswith(XLSX_SIGNATURE)

def _is_xls(content: bytes) -> bool:
    return content.startswith(XLS_SIGNATURE)

def _is_text_like(content: bytes) -> bool:
    try:
        content.decode("utf-8")
        return True
    except UnicodeDecodeError:
        return False

def classify_and_parse(filename: str, content: bytes) -> Dict[str, pd.DataFrame]:
    name = filename.lower()
    logger.debug(f"Classifying file: {name} (size: {len(content)} bytes)")

    # 1. Проверяем по сигнатуре
    if _is_xlsx(content):
        logger.debug("Detected XLSX by signature")
        return read_excel_from_bytes(content)
    elif _is_xls(content):
        logger.debug("Detected XLS by signature")
        return read_excel_from_bytes(content)
    elif _is_text_like(content):
        # Дополнительно можно проверить, похоже ли на CSV
        try:
            # Пробуем прочитать первые строки как CSV
            sample = content[:2048].decode("utf-8", errors="ignore")
            if "," in sample or ";" in sample or "\t" in sample:
                logger.debug("Detected CSV-like text content")
                mvd = read_csv_from_bytes(content)
                return {"mvd_accidents": mvd}
        except Exception as e:
            logger.warning(f"Failed to parse as CSV: {e}")

    # 2. Если сигнатуры не совпали — fallback на расширение
    if name.endswith((".xlsx", ".xls")):
        logger.debug("Fallback to Excel by extension")
        return read_excel_from_bytes(content)
    elif name.endswith(".csv"):
        logger.debug("Fallback to CSV by extension")
        mvd = read_csv_from_bytes(content)
        return {"mvd_accidents": mvd}

    # 3. Неизвестный тип
    raise ValueError(f"Unsupported or unrecognized file type: {filename}")