package http

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/api-gateway/internal/controller/models"
	"github.com/labstack/echo"
	"go.uber.org/zap"
)

// Create Services(only for admin)
func (ctrl *Controller) handleCreateServices(ctx echo.Context) error {
	var req models.CreateServiceRequest

	_, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	if role != adminRole {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	if err := ctx.Bind(&req); err != nil {
		ctrl.log.Error("failed to bind create service request", zap.Error(err))
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": "invalid request body",
		})
	}

	resp, err := ctrl.orderClient.CreateService(req)
	if err != nil {
		ctrl.log.Error("failed to create service", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return ctx.JSON(http.StatusOK, resp.Service)
}

// Update Services (only for admin)
func (ctrl *Controller) handleUpdateServices(ctx echo.Context) error {
	idParam := ctx.Param("id")
	_, err := uuid.Parse(idParam)
	if err != nil {
		ctrl.log.Error("invalid id in path", zap.String("id", idParam), zap.Error(err))
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": "invalid id",
		})
	}

	_, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	if role != adminRole {
		ctrl.log.Error("user is not admin")
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	var req models.UpdateServiceRequest
	if err := ctx.Bind(&req); err != nil {
		ctrl.log.Error("failed to bind update service request", zap.Error(err))
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": "invalid request body",
		})
	}

	dto := models.UpdateServiceDTO{
		ServiceID:   idParam,
		Tittle:      req.Tittle,
		Price:       req.Price,
		Description: req.Description,
	}

	resp, err := ctrl.orderClient.UpdateServices(dto)
	if err != nil {
		ctrl.log.Error("failed to update service", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return ctx.JSON(http.StatusOK, resp)
}

// Delete Services (only for admin)
func (ctrl *Controller) handleDeleteService(ctx echo.Context) error {
	idParam := ctx.Param("id")
	serviceUUID, err := uuid.Parse(idParam)
	if err != nil {
		ctrl.log.Error("invalid id in path", zap.String("id", idParam), zap.Error(err))
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": "invalid id",
		})
	}

	_, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	if role != adminRole {
		ctrl.log.Error("user is not admin")
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	resp, err := ctrl.orderClient.DeleteServices(serviceUUID.String())
	if err != nil {
		ctrl.log.Error("failed to delete service", zap.String("service_id", idParam), zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return ctx.JSON(http.StatusOK, resp)
}

// Get Setvices By ID(for all users)
func (ctrl *Controller) handleGetServicesByID(ctx echo.Context) error {
	id := ctx.Param("id")

	resp, err := ctrl.orderClient.GetServicesByID(id)
	if err != nil {
		ctrl.log.Error("failed to get service by id", zap.String("id", id), zap.Error(err))
		return ctx.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
	}

	return ctx.JSON(http.StatusOK, resp)
}

// List Services(for all users)
func (ctrl *Controller) handleListServices(ctx echo.Context) error {
	limit, err := strconv.Atoi(ctx.QueryParam("limit"))
	if err != nil || limit <= 0 {
		limit = 10
	}
	offset, err := strconv.Atoi(ctx.QueryParam("offset"))
	if err != nil || offset < 0 {
		offset = 0
	}

	req := models.ListServicesRequest{
		Limit:  int32(limit),
		Offset: int32(offset),
	}

	resp, err := ctrl.orderClient.ListServices(req)
	if err != nil {
		ctrl.log.Error("failed to list services", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return ctx.JSON(http.StatusOK, resp)
}

// Create Order(for admin,editor and users, but not unknown status)
func (ctrl *Controller) handleCreateOrder(ctx echo.Context) error {
	var req models.CreateOrderRequest

	if err := ctx.Bind(&req); err != nil {
		ctrl.log.Error("failed to bind create order request", zap.Error(err))
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": "invalid request body",
		})
	}
	id, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	if role != adminRole && role != userRole && role != editorRole {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}
	layout := "2006-01-02 15:04"
	start, err := time.Parse(layout, fmt.Sprintf("%s %s", req.Date, req.StartTime))
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "invalid start_time"})
	}
	end, err := time.Parse(layout, fmt.Sprintf("%s %s", req.Date, req.EndTime))
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "invalid end_time"})
	}

	dto := models.CreateOrderDTO{
		CustomerID:  id.String(),
		ServiceID:   req.ServiceID,
		Description: req.Description,
		Location:    req.Location,
		StartTime:   start.Format(time.RFC3339),
		EndTime:     end.Format(time.RFC3339),
		Date:        req.Date,
	}
	resp, err := ctrl.orderClient.CreateOrder(dto)
	if err != nil {
		ctrl.log.Error("failed to create order", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return ctx.JSON(http.StatusOK, resp)
}

// Get Order For User (only for user role)
func (ctrl *Controller) handleGetOrderForUser(ctx echo.Context) error {
	idParam := ctx.Param("id")
	orderUUID, err := uuid.Parse(idParam)
	if err != nil {
		ctrl.log.Error("invalid order id in path", zap.String("id", idParam), zap.Error(err))
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "invalid order id"})
	}

	customerID, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, map[string]string{"error": "unforbidden"})
	}

	if role != userRole {
		ctrl.log.Error("user is not authorized", zap.String("role", role))
		return ctx.JSON(http.StatusForbidden, map[string]string{"error": "unforbidden"})
	}

	orderResp, err := ctrl.orderClient.GetOrderForUser(customerID.String(), orderUUID.String())
	if err != nil {
		ctrl.log.Error("failed to get order for user", zap.String("order_id", orderUUID.String()), zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return ctx.JSON(http.StatusOK, orderResp)
}

// Get Order By ID (only for admin)
func (ctrl *Controller) handleGetOrderByID(ctx echo.Context) error {
	orderID := ctx.Param("id")
	if _, err := uuid.Parse(orderID); err != nil {
		ctrl.log.Error("invalid order_id in path", zap.String("order_id", orderID), zap.Error(err))
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "invalid order_id"})
	}

	_, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	if role != adminRole {
		ctrl.log.Error("user is not admin")
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	orderResp, err := ctrl.orderClient.GetOrderByID(orderID)
	if err != nil {
		ctrl.log.Error("failed to get order by ID", zap.String("order_id", orderID), zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return ctx.JSON(http.StatusOK, orderResp)
}

// Cancel Order(for admin,editor and users, but not unknown status)
func (ctrl *Controller) handleCancelOrder(ctx echo.Context) error {
	orderID := ctx.Param("id")
	if _, err := uuid.Parse(orderID); err != nil {
		ctrl.log.Error("invalid order_id", zap.String("order_id", orderID), zap.Error(err))
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": "invalid order id",
		})
	}

	userID, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unauthorized")
	}

	if role != userRole && role != adminRole && role != editorRole {
		ctrl.log.Error("only user can cancel order", zap.String("role", role))
		return ctx.JSON(http.StatusForbidden, "forbidden")
	}

	resp, err := ctrl.orderClient.CancelOrder(orderID, userID.String())
	if err != nil {
		ctrl.log.Error("failed to cancel order", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return ctx.JSON(http.StatusOK, resp)
}

// Update Order Status(only for admin)
func (ctrl *Controller) handleUpdateOrderStatus(ctx echo.Context) error {
	var req models.UpdateOrderStatusRequest

	_, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to parse token", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unauthorized")
	}

	if role != adminRole {
		return ctx.JSON(http.StatusForbidden, "only admin can update order status")
	}

	if err := ctx.Bind(&req); err != nil {
		ctrl.log.Error("failed to bind update order status request", zap.Error(err))
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": "invalid request body",
		})
	}

	resp, err := ctrl.orderClient.UpdateOrderStatus(req)
	if err != nil {
		ctrl.log.Error("failed to update order status", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return ctx.JSON(http.StatusOK, resp)
}

// List Orders (only for admin)
func (ctrl *Controller) handleListOrders(ctx echo.Context) error {
	var req models.ListOrdersRequest
	_, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to parse token", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unauthorized")
	}

	if role != adminRole {
		return ctx.JSON(http.StatusForbidden, "only admin can list all orders")
	}

	if err := ctx.Bind(&req); err != nil {
		ctrl.log.Error("failed to bind list orders request", zap.Error(err))
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": "invalid query params",
		})
	}

	resp, err := ctrl.orderClient.ListOrders(req)
	if err != nil {
		ctrl.log.Error("failed to list orders", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return ctx.JSON(http.StatusOK, resp)
}

// ListMyOrders (for admin,editor and users, but not unknown status)
func (ctrl *Controller) handleListMyOrders(ctx echo.Context) error {
	customerID, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to get user data from token", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, map[string]string{"error": "unauthorized"})
	}

	if role != userRole && role != adminRole && role != editorRole {
		ctrl.log.Error("only user can saw my order", zap.String("role", role))
		return ctx.JSON(http.StatusForbidden, "forbidden")
	}

	limit, err := strconv.Atoi(ctx.QueryParam("limit"))
	if err != nil || limit <= 0 {
		limit = 5
	}

	offset, err := strconv.Atoi(ctx.QueryParam("offset"))
	if err != nil || offset < 0 {
		offset = 0
	}

	resp, err := ctrl.orderClient.ListMyOrders(customerID.String(), int32(limit), int32(offset))
	if err != nil {
		ctrl.log.Error("failed to list my orders", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return ctx.JSON(http.StatusOK, resp)
}
