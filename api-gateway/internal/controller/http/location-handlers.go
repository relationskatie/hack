package http

import (
	"net/http"
	"strconv"
	"time"

	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/api-gateway/internal/controller/models"
	"github.com/labstack/echo"
	"go.uber.org/zap"
)

func (ctrl *Controller) handleGetItem(ctx echo.Context) error {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "invalid id"})
	}

	itemResp, err := ctrl.locationClient.GetItem(id)
	if err != nil {
		ctrl.log.Error("GetItem failed", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to get item"})
	}

	res := models.Item{
		ID:     itemResp.Id,
		Title:  itemResp.Title,
		Status: itemResp.Status,
		Type:   itemResp.Type,
	}

	return ctx.JSON(http.StatusOK, res)
}

// CreateItem only for admin
func (ctrl *Controller) handleCreateItem(ctx echo.Context) error {
	_, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	if role != adminRole {
		ctrl.log.Error("user is not admin")
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}
	var req models.CreateItemRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	if req.Title == "" {
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "title is required"})
	}

	if _, ok := validTypes[req.Type]; !ok {
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "invalid type"})
	}

	if _, ok := validStatuses[req.Status]; !ok {
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "invalid status"})
	}

	itemResp, err := ctrl.locationClient.CreateItem(req.Title, req.Status, req.Type)
	if err != nil {
		ctrl.log.Error("CreateItem failed", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to create item"})
	}

	res := models.Item{
		ID:     itemResp.Id,
		Title:  itemResp.Title,
		Status: itemResp.Status,
		Type:   itemResp.Type,
	}

	return ctx.JSON(http.StatusCreated, res)
}

// UpdateItem only for admin
func (ctrl *Controller) handleUpdateItem(ctx echo.Context) error {
	_, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	if role != adminRole {
		ctrl.log.Error("user is not admin")
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "invalid id"})
	}

	var req models.UpdateItemRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	if _, ok := validTypes[req.Type]; !ok {
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "invalid type"})
	}

	if _, ok := validStatuses[req.Status]; !ok {
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "invalid status"})
	}

	itemResp, err := ctrl.locationClient.UpdateItem(id, req.Title, req.Status, req.Type)
	if err != nil {
		ctrl.log.Error("UpdateItem failed", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to update item"})
	}

	res := models.Item{
		ID:     itemResp.Id,
		Title:  itemResp.Title,
		Status: itemResp.Status,
		Type:   itemResp.Type,
	}

	return ctx.JSON(http.StatusOK, res)
}

// DeleteItem only for admin
func (ctrl *Controller) handleDeleteItem(ctx echo.Context) error {
	_, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	if role != adminRole {
		ctrl.log.Error("user is not admin")
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "invalid id"})
	}

	err = ctrl.locationClient.DeleteItem(id)
	if err != nil {
		ctrl.log.Error("DeleteItem failed", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to delete item"})
	}

	return ctx.JSON(http.StatusOK, map[string]string{"message": "item deleted successfully"})
}

func (ctrl *Controller) handleListItems(ctx echo.Context) error {
	itemsResp, err := ctrl.locationClient.ListItems()
	if err != nil {
		ctrl.log.Error("ListItems failed", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to list items"})
	}

	var res []models.Item
	for _, item := range itemsResp {
		res = append(res, models.Item{
			ID:     item.Id,
			Title:  item.Title,
			Status: item.Status,
			Type:   item.Type,
		})
	}

	return ctx.JSON(http.StatusOK, res)
}

// CreateTrafficLight only for admin
func (ctrl *Controller) handleCreateTrafficLight(ctx echo.Context) error {
	_, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unauthorized")
	}

	if role != adminRole {
		ctrl.log.Error("user is not admin")
		return ctx.JSON(http.StatusForbidden, "unauthorized")
	}

	var req models.CreateTrafficLightRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	currentYear := int32(time.Now().Year())
	if req.Year < 1900 || req.Year > currentYear {
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "invalid installation year"})
	}

	tlResp, err := ctrl.locationClient.CreateTrafficLight(req.Address, req.Type, req.Year)
	if err != nil {
		ctrl.log.Error("CreateTrafficLight failed", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to create traffic light"})
	}

	res := models.TrafficLightResponse{
		ID:               tlResp.Id,
		Address:          tlResp.Address,
		Type:             tlResp.Type,
		YearInstallation: tlResp.YearInstallation,
	}

	return ctx.JSON(http.StatusCreated, res)
}

func (ctrl *Controller) handleGetTrafficLight(ctx echo.Context) error {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "invalid id"})
	}

	tlResp, err := ctrl.locationClient.GetTrafficLight(id)
	if err != nil {
		ctrl.log.Error("GetTrafficLight failed", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to get traffic light"})
	}

	res := models.TrafficLightResponse{
		ID:               tlResp.Id,
		Address:          tlResp.Address,
		Type:             tlResp.Type,
		YearInstallation: tlResp.YearInstallation,
	}

	return ctx.JSON(http.StatusOK, res)
}

func (ctrl *Controller) handleDeleteTrafficLight(ctx echo.Context) error {
	_, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unauthorized")
	}

	if role != adminRole {
		ctrl.log.Error("user is not admin")
		return ctx.JSON(http.StatusForbidden, "unauthorized")
	}

	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "invalid id"})
	}

	if err := ctrl.locationClient.DeleteTrafficLight(id); err != nil {
		ctrl.log.Error("DeleteTrafficLight failed", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to delete traffic light"})
	}

	return ctx.JSON(http.StatusOK, map[string]string{"message": "traffic light deleted"})
}

func (ctrl *Controller) handleUpdateTrafficLight(ctx echo.Context) error {
	_, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unauthorized")
	}

	if role != adminRole {
		ctrl.log.Error("user is not admin")
		return ctx.JSON(http.StatusForbidden, "unauthorized")
	}

	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "invalid id"})
	}

	var req models.CreateTrafficLightRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	if req.Year <= 1900 || req.Year > int32(time.Now().Year()) {
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "invalid year_installation"})
	}

	tlResp, err := ctrl.locationClient.UpdateTrafficLight(id, req.Address, req.Type, req.Year)
	if err != nil {
		ctrl.log.Error("UpdateTrafficLight failed", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to update traffic light"})
	}

	res := models.TrafficLightResponse{
		ID:               tlResp.Id,
		Address:          tlResp.Address,
		Type:             tlResp.Type,
		YearInstallation: tlResp.YearInstallation,
	}

	return ctx.JSON(http.StatusOK, res)
}

func (ctrl *Controller) handleListTrafficLights(ctx echo.Context) error {
	tlsResp, err := ctrl.locationClient.ListTrafficLights()
	if err != nil {
		ctrl.log.Error("ListTrafficLights failed", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to list traffic lights"})
	}

	var res []models.TrafficLightResponse
	for _, tl := range tlsResp {
		res = append(res, models.TrafficLightResponse{
			ID:               tl.Id,
			Address:          tl.Address,
			Type:             tl.Type,
			YearInstallation: tl.YearInstallation,
		})
	}

	return ctx.JSON(http.StatusOK, res)
}
