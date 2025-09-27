# analytics_service/app/services/dispatcher.py
from __future__ import annotations

from datetime import date
from typing import Literal, Mapping, Any

from sqlalchemy.engine import Connection

# Сервисные функции (должны существовать у тебя)
from .fines_service import get_fines_timeseries
from .evac_service import get_evac_timeseries
from .mvd_service import get_mvd_timeseries

Widget = Literal["fines", "evac", "mvd"]
Grouping = Literal["day", "week", "month"]


def _validate_widget(widget: str) -> Widget:
    allowed = {"fines", "evac", "mvd"}
    if widget not in allowed:
        raise AssertionError(f"unknown widget: {widget!r}. Allowed: {sorted(allowed)}")
    return widget  # type: ignore[return-value]


def _validate_grouping(widget: Widget, grouping: str | None) -> Grouping:
    # Для МВД группировка всегда "month" (данные помесячные)
    if widget == "mvd":
        return "month"
    if grouping is None:
        return "day"
    if grouping not in {"day", "week", "month"}:
        raise AssertionError("grouping must be one of: day|week|month")
    return grouping  # type: ignore[return-value]


def _validate_range(date_from: date, date_to: date) -> None:
    if date_to < date_from:
        raise AssertionError("date_to must be >= date_from")


def fetch_widget_data(
    conn: Connection,
    widget: str,
    *,
    date_from: date,
    date_to: date,
    grouping: str | None = None,
    is_admin: bool = False,
) -> Mapping[str, Any]:
    """
    Универсальная точка входа для FE/BE.

    Parameters
    ----------
    conn : sqlalchemy Connection
        Открытое соединение (begin()).
    widget : {"fines","evac","mvd"}
        Какой дашборд запрашиваем.
    date_from, date_to : date
        Границы окна для данных (вкл.).
    grouping : {"day","week","month"} | None
        Желаемая группировка (игнорируется для МВД → "month").
    is_admin : bool
        Роль. Влияет на возврат денежных полей/KPI в fines/evac.

    Returns
    -------
    dict:
        Унифицированный JSON для виджета: {"series": {...}, "aggregates": {...}, "kpi"?, "meta": {...}}
    """
    w = _validate_widget(widget)
    g = _validate_grouping(w, grouping)
    _validate_range(date_from, date_to)

    if w == "fines":
        # штрафы: читаем из fines_daily_delta (дельты), агрегация по g, роль влияет на деньги+KPI
        return get_fines_timeseries(
            conn,
            date_from=date_from,
            date_to=date_to,
            grouping=g,          # "day"|"week"|"month"
            is_admin=is_admin,   # True → вернёт деньги и KPI
        )

    if w == "evac":
        # эвакуации: дневные факты, агрегация по g, роль влияет на финансы impound_income
        return get_evac_timeseries(
            conn,
            date_from=date_from,
            date_to=date_to,
            grouping=g,
            is_admin=is_admin,
        )

    # w == "mvd"
    # ВАЖНО: для МВД не передаём лишних аргументов (ни grouping, ни is_admin),
    # т.к. сервис сам возвращает месячные ДЕЛЬТЫ и фиксированную meta.group_by="month".
    return get_mvd_timeseries(
        conn,
        date_from=date_from,
        date_to=date_to,
        is_admin=is_admin
    )
