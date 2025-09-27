# -*- coding: utf-8 -*-
from __future__ import annotations
from typing import Dict, Any, List, Tuple, Optional
from datetime import date, timedelta
import pandas as pd
from sqlalchemy import text
from sqlalchemy.engine import Connection

try:
    # pip install prophet
    from prophet import Prophet
except Exception as e:
    raise RuntimeError("Install 'prophet' package: pip install prophet") from e


from sqlalchemy import text
from logging import getLogger
logger = getLogger(__name__)

def _fetch_series(conn: Connection, metric: str, frm: Optional[date], to: Optional[date]) -> Tuple[pd.DataFrame, str]:
    """
    Возвращает (df, freq), где df = [ds,y], freq ∈ {'day','month'}.
    Для МВД (injured_accidents/...) строим МЕСЯЧНЫЕ ДЕЛЬТЫ из кумулятивов.
    Для эвакуаций (evacuations) берём дневные значения как есть.
    """

    if metric == "injured_accidents":  # MVD monthly (кумулятив → дельты)
        # Чтобы первая дельта была корректной, берём данные с 1 января года frm (если frm задан),
        # иначе — от самого раннего; по верхней границе ограничиваем to (если задан).
        params = {
            "date_from": frm,
            "date_to": to,
            "year_start": None if frm is None else date(frm.year, 1, 1),
        }
        sql = """
        WITH prepared AS (
          SELECT
            date_trunc('month', date_to)::date AS period,        -- ключ месяца = конец окна
            EXTRACT(YEAR FROM date_to)::int     AS y,
            injured_accidents
          FROM analytics_private.mvd_accidents
          WHERE (:year_start IS NULL OR date_to >= :year_start)
            AND (:date_to    IS NULL OR date_to <= :date_to)
        ),
        monthly AS (
          -- ОДНА СТРОКА НА МЕСЯЦ: берём максимальный кумулятив в месяце
          SELECT period, y, MAX(injured_accidents)::bigint AS cum
          FROM prepared
          GROUP BY period, y
        ),
        deltas AS (
          SELECT
            period AS ds,
            GREATEST(0, cum - COALESCE(LAG(cum) OVER (PARTITION BY y ORDER BY period), 0))::bigint AS y
          FROM monthly
        )
        SELECT ds, y
        FROM deltas
        WHERE (:date_from IS NULL OR ds >= :date_from)
          AND (:date_to   IS NULL OR ds <= :date_to)
        ORDER BY ds
        """
        rows = list(conn.execute(text(sql), params).mappings())
        df = pd.DataFrame(rows)
        freq = "month"

    elif metric == "evacuations":  # daily evac (не кумулятив)
        sql = """
        SELECT dt AS ds, evacuations AS y
        FROM analytics_private.evac_daily
        WHERE (:frm IS NULL OR dt >= :frm)
          AND (:to  IS NULL OR dt <= :to)
        ORDER BY ds
        """
        rows = list(conn.execute(text(sql), {"frm": frm, "to": to}).mappings())
        df = pd.DataFrame(rows)
        freq = "day"

    else:
        # при необходимости сюда можно добавить и другие метрики (штрафы дельтами и т.п.)
        raise ValueError(f"Unsupported metric for forecast: {metric}")

    if df.empty:
        raise ValueError("Empty training set")

    # ensure continuous timeline for Prophet (заполняем пропуски дат)
    df["ds"] = pd.to_datetime(df["ds"])
    df = df.sort_values("ds")
    if freq == "day":
        full = pd.DataFrame({"ds": pd.date_range(df["ds"].min(), df["ds"].max(), freq="D")})
    else:
        full = pd.DataFrame({"ds": pd.date_range(df["ds"].min(), df["ds"].max(), freq="MS")})
    df = full.merge(df, on="ds", how="left")

    # отрезаем хвост после последнего ненулевого значения, чтобы не тянуть пустоту
    mask = df["y"].notna()
    last_idx = mask[::-1].idxmax()
    df = df.loc[:last_idx].copy()

    # заполняем пропуски интерполяцией — Prophet не любит NaN
    df["y"] = df["y"].interpolate(method="linear", limit_direction="both")

    return df, freq


def _build_prophet(freq: str) -> Prophet:
    if freq == "month":
        m = Prophet(
            yearly_seasonality=True, weekly_seasonality=False, daily_seasonality=False,
            changepoint_prior_scale=0.2,
        )
        # годовая сезонность по умолчанию ок
        return m
    else:  # day
        m = Prophet(
            yearly_seasonality=True, weekly_seasonality=True, daily_seasonality=False,
            changepoint_prior_scale=0.15,
        )
        return m


def _cv_metrics(y_true, y_pred):
    import numpy as np
    y_true = np.asarray(y_true, float)
    y_pred = np.asarray(y_pred, float)

    mae = float(np.mean(np.abs(y_true - y_pred)))

    # MAPE только на положительных истинных значениях
    pos = y_true > 0
    mape = float(np.mean(np.abs((y_true[pos] - y_pred[pos]) / y_true[pos]))) if pos.any() else None

    smape = float(np.mean(2*np.abs(y_true - y_pred) / (np.abs(y_true)+np.abs(y_pred)+1e-9)))
    out = {"mae": round(mae,3), "smape": round(smape,3)}
    if mape is not None:
        out["mape"] = round(mape,3)
    return out



def forecast_metric(
    conn: Connection,
    metric: str,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    horizon: Optional[int] = None,
    debug: bool = False,
) -> Dict[str, Any]:
    """
    Главная функция прогноза.
    """
    df, freq = _fetch_series(conn, metric, date_from, date_to)

    # sanity: минимальная длина ряда
    min_len = 12 if freq == "month" else 60
    if len(df) < min_len:
        raise ValueError(f"Time series too short: {len(df)} points (<{min_len})")

    # horizon
    if horizon is None:
        horizon = 6 if freq == "month" else 14
    if horizon <= 0:
        raise ValueError("horizon must be positive")

    cap = max( df["y"].max() * 1.2, 1.0 )
    df["cap"] = cap
    df["floor"] = 0.0
    
    m = _build_prophet(freq)
    m.fit(df.rename(columns={"ds": "ds", "y": "y"}))

    # future df
    if freq == "month":
        future = m.make_future_dataframe(periods=horizon, freq="MS", include_history=False)
    else:
        future = m.make_future_dataframe(periods=horizon, freq="D", include_history=False)

    fc = m.predict(future)[["ds", "yhat", "yhat_lower", "yhat_upper"]]
    fc["ds"] = fc["ds"].dt.date
    forecast = [
        {"ds": str(r.ds), "yhat": float(r.yhat), "yhat_lower": float(r.yhat_lower), "yhat_upper": float(r.yhat_upper)}
        for r in fc.itertuples(index=False)
    ]

    # last_hist = df.tail(2).copy()
    # last_hist["ds"] = last_hist["ds"].dt.date
    # last_history = [{"ds": str(r.ds), "y": int(r.y)} for r in last_hist.itertuples(index=False)]

    tail_len = 24 if freq=="month" else 60
    hist_tail = df.tail(tail_len).copy()
    hist_tail["ds"] = hist_tail["ds"].dt.date
    history_tail = [{"ds": str(r.ds), "y": float(r.y)} for r in hist_tail.itertuples(index=False)]
    
    out = {
        "train_range": [str(df["ds"].min().date()), str(df["ds"].max().date())],
        "freq": freq,
        "forecast": forecast,
        "last_history": history_tail,
        "meta": {"metric": metric, "horizon": horizon},
    }

    if debug:
        # простая CV: отрезаем последние k шагов по 1 шагу
        k = 3
        if len(df) > k + min_len:
            actual = []
            pred = []
            for i in range(1, k + 1):
                cut = df.iloc[: -i]  # учим на истории без последних i точек
                if len(cut) < min_len:
                    break
                mm = _build_prophet(freq)
                mm.fit(cut.rename(columns={"ds": "ds", "y": "y"}))
                if freq == "month":
                    fut = mm.make_future_dataframe(periods=1, freq="MS", include_history=False)
                else:
                    fut = mm.make_future_dataframe(periods=1, freq="D", include_history=False)
                pred_df = mm.predict(fut)
                pred.append(float(pred_df["yhat"].iloc[0]))
                actual.append(float(df["y"].iloc[-i]))
            if actual and pred:
                cv = _cv_metrics(pd.Series(actual[::-1]), pd.Series(pred[::-1]))
                out["meta"]["cv"] = cv

    return out
