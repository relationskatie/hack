import pandas as pd

def ensure_monotonic_cumulative(df: pd.DataFrame, cols: list):
    """Лог-правка: отрицательные дельты приводим к нулю (для информирования)."""
    warnings = []
    for c in cols:
        delta = df[c].diff().fillna(df[c])
        neg = (delta < 0).sum()
        if neg > 0:
            warnings.append(f"{c}: {neg} non-monotonic steps in cumulative series")
    return warnings
