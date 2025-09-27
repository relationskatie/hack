import os
import json
import time
from concurrent import futures
from datetime import date, datetime

import pandas as pd

from smolathon_arxiv.analytics_service.app.etl.bytes_import import classify_and_parse
from smolathon_arxiv.analytics_service.app.etl.importer import run_byte_import, run_byte_import_upsert

from configuration.logger import logger
from configuration.config import settings

import grpc
from sqlalchemy import create_engine

from generated_proto import analitic_pb2 as pb
from generated_proto import analitic_pb2_grpc as pbg

from smolathon_arxiv.analytics_service.app.services.dispatcher import fetch_widget_data
from smolathon_arxiv.analytics_service.app.services.compare_service import compare_periods
from smolathon_arxiv.analytics_service.app.services.forecast_service import forecast_metric
from smolathon_arxiv.analytics_service.app.etl.importer import run_import

try:
    from grpc_reflection.v1alpha import reflection
    USE_REFLECTION = True
except Exception:
    USE_REFLECTION = False

PG_DSN = settings.db.url#"postgresql+psycopg2://user:pass@localhost:5433/city"
engine = create_engine(PG_DSN, future=True)

# ==== helpers ====
def _iso(d: date) -> str:
    return d.isoformat()

def _parse_iso(s: str) -> date:
    return date.fromisoformat(s)

def _group_by_to_str(gb: str) -> str:
    logger.debug(f"{gb}")
    if gb == "day": return "day"
    elif gb == "week": return "week"
    elif gb == "month": return "month"
    else: return gb

def _meta(group_by: str, is_admin: bool) -> pb.Meta:
    return pb.Meta(
        group_by = group_by,
        admin = is_admin
    )

def _series_map_to_proto(series_dict: dict, mvd: bool = False) -> dict:
    """series_dict: {"metric": [{"dt": "...", "value": N} or {"period":"...","value":N}], ...}"""
    out = {}
    for name, points in series_dict.items():
        pts = []
        for p in points:
            if mvd:
                pts.append(pb.Point(period=p.get("period",""), value=int(p["value"])))
            else:
                pts.append(pb.Point(dt=p.get("dt",""), value=int(p["value"])))
        out[name] = pb.Series(points=pts)
    return out

def _aggregates_to_proto(aggregates: dict) -> pb.Aggregates:
    sums = {k: int(v) for k, v in aggregates.get("sum", {}).items()}
    avgs = {k: float(v) for k, v in aggregates.get("avg", {}).items()}
    return pb.Aggregates(sum=sums, avg=avgs)

def _kpi_to_proto(kpi: dict | None) -> pb.KPI:
    logger.debug(f"{kpi}")
    if not kpi:
        return pb.KPI()  # нули по умолчанию
    value = kpi.get("collection_rate") or 0.0
    return pb.KPI(collection_rate=float(value))

def _period_to_proto(d: dict) -> pb.PeriodAgg:
    avg = d.get("avg", None)
    if avg is None:
        return pb.PeriodAgg(from_date=d["from"], to_date=d["to"], sum=int(d["sum"]), avg=0.0, avg_set=False)
    return pb.PeriodAgg(from_date=d["from"], to_date=d["to"], sum=int(d["sum"]), avg=float(avg), avg_set=True)

def _diff_to_proto(d: dict) -> pb.Diff:
    rel = d.get("rel", None)
    if rel is None:
        return pb.Diff(abs=int(d.get("abs", 0)), rel=0.0, rel_set=False)
    return pb.Diff(abs=int(d.get("abs", 0)), rel=float(rel), rel_set=True)

def _forecast_data_to_proto(forecast_data: dict):
    """Converts the forecast data dictionary to protobuf message fields."""
    # Пример структуры, соответствует возвращаемому значению forecast_metric
    response = pb.GetForecastResponse()

    # train_range
    response.train_range.from_date = forecast_data["train_range"][0]
    response.train_range.to_date = forecast_data["train_range"][1]

    # freq
    response.freq = forecast_data["freq"]

    # forecast
    for f_point in forecast_data["forecast"]:
        proto_point = pb.ForecastPoint()
        proto_point.ds = f_point["ds"]
        proto_point.yhat = f_point["yhat"]
        proto_point.yhat_lower = f_point["yhat_lower"]
        proto_point.yhat_upper = f_point["yhat_upper"]
        response.forecast.append(proto_point)

    # last_history
    for h_point in forecast_data["last_history"]:
        proto_point = pb.HistoryPoint()
        proto_point.ds = h_point["ds"]
        proto_point.y = h_point["y"]
        response.last_history.append(proto_point)

    # meta
    meta_info = forecast_data["meta"]
    response.meta.metric = meta_info["metric"]
    response.meta.horizon = meta_info["horizon"]
    # Проверяем наличие кросс-валидации
    if "cv" in meta_info:
        cv_metrics = meta_info["cv"]
        response.meta.cv.mae = cv_metrics.get("mae", 0.0)
        response.meta.cv.smape = cv_metrics.get("smape", 0.0)
        response.meta.cv.mape = cv_metrics.get("mape", 0.0)

    return response


# ==== servicer ====
class AnalyticsServicer(pbg.AnalyticsServiceServicer):
    def GetFines(self, request: pb.FinesRequest, context):
        group_by = _group_by_to_str(request.group_by)
        is_admin = not request.public
        logger.debug(f"{request}, {group_by}, {request.range.from_date} , {request.range.to_date}")
        with engine.begin() as conn:
            data = fetch_widget_data(
                conn, "fines",
                date_from=_parse_iso(request.range.from_date),
                date_to=_parse_iso(request.range.to_date),
                grouping=group_by,
                is_admin=is_admin
            )
        return pb.FinesResponse(
            series=_series_map_to_proto(data["series"], mvd=False),
            aggregates=_aggregates_to_proto(data["aggregates"]),
            kpi=_kpi_to_proto(data.get("kpi")),
            meta=_meta(group_by, is_admin)
        )

    def GetEvac(self, request: pb.EvacRequest, context):
        group_by = _group_by_to_str(request.group_by)
        is_admin = not request.public
        logger.debug(f"{request}, {group_by}, {request.range.from_date} , {request.range.to_date}")
        with engine.begin() as conn:
            data = fetch_widget_data(
                conn, "evac",
                date_from=_parse_iso(request.range.from_date),
                date_to = _parse_iso(request.range.to_date),
                grouping = group_by,
                is_admin = is_admin
            )
            return pb.EvacResponse(
                series=_series_map_to_proto(data["series"], mvd=False),
                aggregates=_aggregates_to_proto(data["aggregates"]),
                meta=_meta(group_by, is_admin)
            )

    def GetDtp(self, request: pb.DtpRequest, context):
        with engine.begin() as conn:
            data = fetch_widget_data(
                conn, "mvd",
                date_from=_parse_iso(request.range.
            from_date),
            date_to = _parse_iso(request.range.to_date),
            )
            return pb.DtpResponse(
                series=_series_map_to_proto(data["series"], mvd=True),
                aggregates=_aggregates_to_proto(data["aggregates"]),
                meta=_meta("month", False)
            )

    def Compare(self, request: pb.CompareRequest, context):
        is_admin = not request.public
        logger.debug(f"{request}")
        with engine.begin() as conn:
            try:
                data = compare_periods(
                    conn, request.metric,
                    _parse_iso(request.period_a.
                from_date), _parse_iso(request.period_a.to_date),
                _parse_iso(request.period_b.
                from_date), _parse_iso(request.period_b.to_date),
                is_admin = is_admin
                )
            except ValueError as e:
                context.abort(grpc.StatusCode.INVALID_ARGUMENT, str(e))
            except PermissionError as e:
                context.abort(grpc.StatusCode.PERMISSION_DENIED, str(e))
        return pb.CompareResponse(
            metric=data["metric"],
            period_a=_period_to_proto(data["period_a"]),
            period_b=_period_to_proto(data["period_b"]),
            diff=_diff_to_proto(data["diff"]),
            admin=is_admin
        )

    def GetForecast(self, request: pb.GetForecastRequest, context):
        logger.debug(f"GetForecast request: {request}")

        valid_metrics = ["injured_accidents", "evacuations"]
        if request.metric not in valid_metrics:
             logger.debug(f"Unsupported metric requested: {request.metric}")
             context.abort(grpc.StatusCode.INVALID_ARGUMENT, f"Unsupported metric: {request.metric}. Valid options are {valid_metrics}.")

        horizon = request.horizon if request.horizon > 0 else None


        with engine.begin() as conn:
            try:
                result_data = forecast_metric(
                    conn=conn,
                    metric=request.metric,
                    date_from=None,
                    date_to=None,
                    horizon=horizon,
                    debug=False
                )
            except ValueError as e:
                logger.info(f"Forecast service ValueError: {e}")
                context.abort(grpc.StatusCode.INVALID_ARGUMENT, str(e))

        try:
            proto_response = _forecast_data_to_proto(result_data)
        except Exception as e: # Ловим потенциальные ошибки при преобразовании
             logger.error(f"Error converting forecast result to proto: {e}")
             context.abort(grpc.StatusCode.INTERNAL, "An internal error occurred while formatting the response.")

        # Возврат protobuf-сообщения
        return proto_response



    def ImportBytes(self, request: pb.ImportBytesRequest, context):
        if not request.files:
            context.abort(grpc.StatusCode.INVALID_ARGUMENT, "no files provided")

        mode = request.mode or "append"
        # Соберём все df из всех присланных файлов
        merged = {}
        logger.debug(f"{request}")
        for f in request.files:
            try:
                parts = classify_and_parse(f.filename, f.content)
                logger.debug(f"part1, {parts}")
            except Exception as e:
                context.abort(grpc.StatusCode.INVALID_ARGUMENT, f"parse error {f.filename}: {e}")
            logger.debug(f"parts, {parts}")
            # мержим по ключам таблиц
            for tbl, df in parts.items():
                if tbl not in merged:
                    merged[tbl] = df
                else:
                    merged[tbl] = pd.concat([merged[tbl], df], ignore_index=True)

        # Валидации базовые (пример: нет отрицательных значений по ключевым полям)
        # … можно добавить тут же
        logger.debug(f"merged, {merged}")
        # Транзакционно upsert’им
        try:
            mode = request.mode or "append"
            logger.debug(f"-----------ok1------------")
            with engine.begin() as conn:
                if mode == "append": summary = run_byte_import_upsert(PG_DSN, merged)
                elif mode == "replace": summary = run_byte_import(PG_DSN, merged)
                else: context.abort(grpc.StatusCode.INTERNAL, f"unckniwn mode: {e}")
            logger.debug(f"-----------ok2------------")
            return pb.ImportBytesResponse(status="ok", summary_json=json.dumps(summary, ensure_ascii=False))
        except Exception as e:
            context.abort(grpc.StatusCode.INTERNAL, f"db import failed: {e}")

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=8))
    pbg.add_AnalyticsServiceServicer_to_server(AnalyticsServicer(), server)

    # reflection (grpcurl list)
    if USE_REFLECTION:
        SERVICE_NAMES = (
            pb.DESCRIPTOR.services_by_name['AnalyticsService'].full_name,
            reflection.SERVICE_NAME,
        )
        reflection.enable_server_reflection(SERVICE_NAMES, server)

    server.add_insecure_port(f"[::]:50052")
    server.start()
    print(f"gRPC server started on :50052")
    try:
        while True:
            time.sleep(86400)
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == "__main__":
    serve()
