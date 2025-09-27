package http

import (
	"fmt"
	"net/http"

	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/api-gateway/internal/controller/models"
	"github.com/labstack/echo"
	"go.uber.org/zap"
)

func (ctrl *Controller) handleGetFines(ctx echo.Context) error {
	var req models.FinesRequest
	if err := ctx.Bind(&req); err != nil {
		ctrl.log.Error("invalid request body", zap.Error(err))
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": "invalid request body",
		})
	}

	if req.Range.FromDate == "" || req.Range.ToDate == "" {
		ctrl.log.Error("from_date or to_date missing", zap.Any("range", req.Range))
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": "from_date and to_date are required",
		})
	}

	if req.GroupBy == "" {
		req.GroupBy = "day"
	}

	_, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
	}

	if role != adminRole {
		req.Public = true
	} else {
		req.Public = false
	}

	ctrl.log.Info("req is public", zap.Any("req:", req.Public))

	resp, err := ctrl.analiticClient.GetFines(req)
	if err != nil {
		ctrl.log.Error("failed to get fines", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return ctx.JSON(http.StatusOK, resp)
}

func (ctrl *Controller) handleGetEvac(ctx echo.Context) error {
	var req models.EvacRequest
	if err := ctx.Bind(&req); err != nil {
		ctrl.log.Error("invalid request body", zap.Error(err))
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": "invalid request body",
		})
	}

	if req.Range.FromDate == "" || req.Range.ToDate == "" {
		ctrl.log.Error("from_date or to_date missing", zap.Any("range", req.Range))
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": "from_date and to_date are required",
		})
	}

	if req.GroupBy == "" {
		req.GroupBy = "day"
	}

	_, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to get token from header", zap.Error(err))

	}

	if role != adminRole {
		req.Public = true
	} else {
		req.Public = false
	}

	ctrl.log.Info("Evac request is public", zap.Bool("public", req.Public))

	resp, err := ctrl.analiticClient.GetEvac(req)
	if err != nil {
		ctrl.log.Error("failed to get evacuation data", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return ctx.JSON(http.StatusOK, resp)
}

func (ctrl *Controller) handleGetDtp(ctx echo.Context) error {
	var req models.DtpRequest
	if err := ctx.Bind(&req); err != nil {
		ctrl.log.Error("invalid request body", zap.Error(err))
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": "invalid request body",
		})
	}

	if req.Range.FromDate == "" || req.Range.ToDate == "" {
		ctrl.log.Error("from_date or to_date missing", zap.Any("range", req.Range))
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": "from_date and to_date are required",
		})
	}

	resp, err := ctrl.analiticClient.GetDtp(req)
	if err != nil {
		ctrl.log.Error("failed to get DTP data", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return ctx.JSON(http.StatusOK, resp)
}

func (ctrl *Controller) handleCompare(ctx echo.Context) error {
	var req models.CompareRequest
	if err := ctx.Bind(&req); err != nil {
		ctrl.log.Error("invalid request body", zap.Error(err))
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": "invalid request body",
		})
	}

	if req.Metric == "" {
		ctrl.log.Error("metric is required", zap.Any("request", req))
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": "metric is required",
		})
	}

	if req.PeriodA.FromDate == "" || req.PeriodA.ToDate == "" ||
		req.PeriodB.FromDate == "" || req.PeriodB.ToDate == "" {
		ctrl.log.Error("period_a or period_b missing", zap.Any("request", req))
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": "period_a and period_b dates are required",
		})
	}

	_, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
	}

	if role != adminRole {
		req.Public = true
	} else {
		req.Public = false
	}

	ctrl.log.Info("Compare request is public", zap.Bool("public", req.Public))

	resp, err := ctrl.analiticClient.Compare(req)
	if err != nil {
		ctrl.log.Error("failed to get compare data", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return ctx.JSON(http.StatusOK, resp)
}

func (ctrl *Controller) handleGetForecast(ctx echo.Context) error {
	var req models.GetForecastRequest
	if err := ctx.Bind(&req); err != nil {
		ctrl.log.Error("invalid request body", zap.Error(err))
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": "invalid request body",
		})
	}

	if req.Metric == "" {
		ctrl.log.Error("metric is required", zap.Any("request", req))
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": "metric is required",
		})
	}

	if req.Horizon == 0 {
		switch req.Metric {
		case "injured_accidents":
			req.Horizon = 6 // месяцев
		case "evacuations":
			req.Horizon = 14 // дней
		default:
			req.Horizon = 6
		}
	}

	ctrl.log.Info("GetForecast request", zap.String("metric", req.Metric), zap.Int32("horizon", req.Horizon))

	resp, err := ctrl.analiticClient.GetForecast(req)
	if err != nil {
		ctrl.log.Error("failed to get forecast", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return ctx.JSON(http.StatusOK, resp)
}

func (ctrl *Controller) handleImportBytes(ctx echo.Context) error {
	_, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, map[string]string{
			"error": "unauthorized",
		})
	}

	if role != adminRole {
		ctrl.log.Error("only admin can import files", zap.String("role", role))
		return ctx.JSON(http.StatusForbidden, map[string]string{
			"error": "forbidden",
		})
	}

	var req models.ImportBytesRequest
	if err := ctx.Bind(&req); err != nil {
		ctrl.log.Error("invalid request body", zap.Error(err))
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": "invalid request body",
		})
	}

	if len(req.Files) == 0 {
		ctrl.log.Error("no files provided")
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": "no files provided",
		})
	}

	for _, f := range req.Files {
		if f.Content == "" {
			ctrl.log.Error("empty content", zap.String("filename", f.Filename))
			return ctx.JSON(http.StatusBadRequest, map[string]string{
				"error": fmt.Sprintf("file %s has empty content", f.Filename),
			})
		}
	}

	if req.Mode == "" {
		req.Mode = "append"
	}

	resp, err := ctrl.analiticClient.ImportBytes(req)
	if err != nil {
		ctrl.log.Error("failed to import files", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return ctx.JSON(http.StatusOK, resp)
}
