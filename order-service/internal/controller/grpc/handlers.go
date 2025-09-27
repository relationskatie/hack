package grpc

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/order-service/internal/repository/models"
	order "github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/order-service/proto"
	"go.uber.org/zap"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (ctrl *Controller) CreateService(ctx context.Context, req *order.CreateServiceRequest) (*order.CreateServiceResponse, error) {
	ctrl.logger.Info("CreateService called", zap.Any("req", req))

	service := models.Service{
		ID:           uuid.New(),
		Tittle:       req.Tittle,
		Price:        req.Price,
		Description:  req.Description,
		NeedSchedule: req.NeedSchedule,
	}

	if req.NeedSchedule {
		for _, slot := range req.Schedule {
			parsedDate, err := time.Parse("2006-01-02", slot.Date)
			if err != nil {
				ctrl.logger.Error("failed to parse timeslot date", zap.String("date", slot.Date), zap.Error(err))
				return nil, err
			}
			service.Schedule = append(service.Schedule, models.TimeSlot{
				ID:        uuid.New(),
				ServiceID: service.ID,
				Date:      parsedDate,
				StartTime: slot.StartTime,
				EndTime:   slot.EndTime,
				IsBooked:  slot.IsBooked,
			})
		}
	}

	if err := ctrl.repo.CreateService(ctx, service); err != nil {
		ctrl.logger.Error("failed to create service", zap.Error(err))
		return nil, err
	}

	ctrl.logger.Info("service created successfully", zap.String("service_id", service.ID.String()))

	var scheduleResp []*order.TimeSlot
	for _, slot := range service.Schedule {
		scheduleResp = append(scheduleResp, &order.TimeSlot{
			Date:      slot.Date.Format("2006-01-02"),
			StartTime: slot.StartTime,
			EndTime:   slot.EndTime,
			IsBooked:  slot.IsBooked,
		})
	}

	resp := &order.CreateServiceResponse{
		Service: &order.ServiceInfo{
			Id:           service.ID.String(),
			Tittle:       service.Tittle,
			Price:        service.Price,
			Description:  service.Description,
			NeedSchedule: service.NeedSchedule,
			Schedule:     scheduleResp,
		},
	}

	return resp, nil
}

func (c *Controller) ListServices(ctx context.Context, req *order.ListServicesRequest) (*order.ListServicesResponse, error) {
	c.logger.Info("ListServices called", zap.Any("req", req))

	limit := int(req.Limit)
	offset := int(req.Offset)

	if req.Limit == 0 {
		limit = 5
	}
	services, total, err := c.repo.ListServices(ctx, limit, offset)
	if err != nil {
		c.logger.Error("failed to list services", zap.Error(err))
		return nil, err
	}

	respServices := make([]*order.ShortServiceInfo, 0, len(services))
	for _, s := range services {
		respServices = append(respServices, &order.ShortServiceInfo{
			Id:           s.ID.String(),
			Tittle:       s.Tittle,
			Price:        s.Price,
			Description:  s.Description,
			NeedSchedule: s.NeedSchedule,
		})
	}

	return &order.ListServicesResponse{
		Services:   respServices,
		TotalCount: int32(total),
	}, nil
}

func (c *Controller) GetService(ctx context.Context, req *order.GetServiceRequest) (*order.GetServiceResponse, error) {
	c.logger.Info("GetService called", zap.String("service_id", req.ServiceId))

	serviceUUID, err := uuid.Parse(req.ServiceId)
	if err != nil {
		c.logger.Error("invalid service_id", zap.String("service_id", req.ServiceId), zap.Error(err))
		return nil, status.Errorf(codes.InvalidArgument, "invalid service_id: %v", err)
	}

	service, err := c.repo.GetServiceByID(ctx, serviceUUID)
	if err != nil {
		c.logger.Error("failed to get service", zap.String("service_id", req.ServiceId), zap.Error(err))
		return nil, status.Errorf(codes.NotFound, "service not found: %v", err)
	}

	var schedule []*order.TimeSlot
	for _, slot := range service.Schedule {
		schedule = append(schedule, &order.TimeSlot{
			Date:      slot.Date.Format("2006-01-02"),
			StartTime: slot.StartTime,
			EndTime:   slot.EndTime,
			IsBooked:  slot.IsBooked,
		})
	}

	resp := &order.GetServiceResponse{
		Service: &order.ServiceInfo{
			Id:           service.ID.String(),
			Tittle:       service.Tittle,
			Description:  service.Description,
			Price:        service.Price,
			NeedSchedule: service.NeedSchedule,
			Schedule:     schedule,
		},
	}

	c.logger.Info("service fetched successfully", zap.String("service_id", service.ID.String()))
	return resp, nil
}

func (c *Controller) DeleteService(ctx context.Context, req *order.DeleteServiceRequest) (*order.DeleteServiceResponse, error) {
	c.logger.Info("DeleteService called", zap.String("service_id", req.ServiceId))

	serviceID, err := uuid.Parse(req.ServiceId)
	if err != nil {
		c.logger.Error("invalid service ID", zap.String("service_id", req.ServiceId), zap.Error(err))
		return &order.DeleteServiceResponse{
			Success: false,
			Message: "invalid service ID",
		}, nil
	}

	err = c.repo.DeleteService(ctx, serviceID)
	if err != nil {
		c.logger.Error("failed to delete service", zap.String("service_id", req.ServiceId), zap.Error(err))
		return &order.DeleteServiceResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &order.DeleteServiceResponse{
		Success: true,
		Message: "service deleted successfully",
	}, nil
}

func (ctrl *Controller) UpdateService(ctx context.Context, req *order.UpdateServiceRequest) (*order.UpdateServiceResponse, error) {
	ctrl.logger.Info("UpdateService called", zap.Any("req", req))

	serviceID, err := uuid.Parse(req.ServiceId)
	if err != nil {
		ctrl.logger.Error("invalid service_id", zap.String("service_id", req.ServiceId), zap.Error(err))
		return nil, err
	}

	service := models.Service{
		ID:          serviceID,
		Tittle:      req.Tittle,
		Price:       req.Price,
		Description: req.Description,
	}

	err = ctrl.repo.UpdateService(ctx, service)
	if err != nil {
		ctrl.logger.Error("failed to update service", zap.String("service_id", service.ID.String()), zap.Error(err))
		return nil, err
	}

	resp := &order.UpdateServiceResponse{
		Message: "service updated successfully",
	}

	return resp, nil
}

func (c *Controller) CreateOrder(ctx context.Context, req *order.CreateOrderRequest) (*order.CreateOrderResponse, error) {
	c.logger.Info("CreateOrder called", zap.Any("req", req))

	customerID, err := uuid.Parse(req.CustomerId)
	if err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "invalid customer_id")
	}

	serviceID, err := uuid.Parse(req.ServiceId)
	if err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "invalid service_id")
	}

	var startTime, endTime time.Time
	if req.ScheduledStartTime != "" && req.ScheduledEndTime != "" {
		startTime, err = time.Parse(time.RFC3339, req.ScheduledStartTime)
		if err != nil {
			return nil, status.Errorf(codes.InvalidArgument, "invalid scheduled_start_time")
		}

		endTime, err = time.Parse(time.RFC3339, req.ScheduledEndTime)
		if err != nil {
			return nil, status.Errorf(codes.InvalidArgument, "invalid scheduled_end_time")
		}

		if !endTime.After(startTime) {
			return nil, status.Errorf(codes.InvalidArgument, "scheduled_end_time must be after scheduled_start_time")
		}
	}

	var orderDate time.Time
	if req.Date != "" {
		orderDate, err = time.Parse("2006-01-02", req.Date)
		if err != nil {
			return nil, status.Errorf(codes.InvalidArgument, "invalid date format, must be YYYY-MM-DD")
		}
	}

	service, err := c.repo.GetServiceByID(ctx, serviceID)
	if err != nil {
		c.logger.Error("failed to fetch service", zap.Error(err))
		return nil, status.Errorf(codes.NotFound, "service not found")
	}

	orderModel := models.Order{
		ID:                 uuid.New(),
		CustomerID:         customerID,
		ServiceID:          serviceID,
		Description:        req.Description,
		Location:           req.Location,
		ScheduledStartTime: startTime,
		ScheduledEndTime:   endTime,
		Status:             int(order.OrderStatus_PENDING),
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
		Date:               orderDate,
	}

	if err := c.repo.CreateOrder(ctx, orderModel, service.NeedSchedule); err != nil {
		c.logger.Error("failed to create order", zap.Error(err))
		return nil, status.Errorf(codes.Internal, err.Error())
	}

	resp := &order.CreateOrderResponse{
		OrderId: orderModel.ID.String(),
		Service: &order.ShortServiceInfo{
			Id:           service.ID.String(),
			Tittle:       service.Tittle,
			Price:        service.Price,
			Description:  service.Description,
			NeedSchedule: service.NeedSchedule,
		},
		Status:    order.OrderStatus_PENDING,
		CreatedAt: orderModel.CreatedAt.Format(time.RFC3339),
	}

	c.logger.Info("order created successfully", zap.String("order_id", orderModel.ID.String()))
	return resp, nil
}

func (c *Controller) GetOrder(ctx context.Context, req *order.GetOrderRequest) (*order.GetOrderResponse, error) {
	c.logger.Info("GetOrder called", zap.String("order_id", req.OrderId), zap.String("customer_id", req.CustomerId))

	orderID, err := uuid.Parse(req.OrderId)
	if err != nil {
		c.logger.Error("invalid order_id", zap.String("order_id", req.OrderId), zap.Error(err))
		return nil, status.Errorf(codes.InvalidArgument, "invalid order_id: %v", err)
	}

	customerID, err := uuid.Parse(req.CustomerId)
	if err != nil {
		c.logger.Error("invalid customer_id", zap.String("customer_id", req.CustomerId), zap.Error(err))
		return nil, status.Errorf(codes.InvalidArgument, "invalid customer_id: %v", err)
	}

	orderModel, err := c.repo.GetOrder(ctx, orderID, customerID)
	if err != nil {
		c.logger.Error("failed to get order", zap.String("order_id", req.OrderId), zap.Error(err))
		return nil, status.Errorf(codes.NotFound, "order not found: %v", err)
	}

	resp := &order.GetOrderResponse{
		OrderId:            orderModel.ID.String(),
		CustomerId:         orderModel.CustomerID.String(),
		ServiceId:          orderModel.ServiceID.String(),
		Description:        orderModel.Description,
		Location:           orderModel.Location,
		ScheduledStartTime: orderModel.ScheduledStartTime.Format(time.RFC3339),
		ScheduledEndTime:   orderModel.ScheduledEndTime.Format(time.RFC3339),
		Status:             order.OrderStatus(orderModel.Status),
		CreatedAt:          orderModel.CreatedAt.Format(time.RFC3339),
		UpdatedAt:          orderModel.UpdatedAt.Format(time.RFC3339),
	}

	c.logger.Info("order fetched successfully", zap.String("order_id", orderModel.ID.String()))
	return resp, nil
}

func (c *Controller) GetOrderByID(ctx context.Context, req *order.GetOrderByIDRequest) (*order.GetOrderByIDResponse, error) {
	c.logger.Info("GetOrderByIDForAdmin called", zap.String("order_id", req.OrderId))

	orderUUID, err := uuid.Parse(req.OrderId)
	if err != nil {
		c.logger.Error("invalid order_id", zap.String("order_id", req.OrderId), zap.Error(err))
		return nil, status.Errorf(codes.InvalidArgument, "invalid order_id: %v", err)
	}

	orderModel, err := c.repo.GetOrderByID(ctx, orderUUID)
	if err != nil {
		c.logger.Error("failed to get order", zap.String("order_id", req.OrderId), zap.Error(err))
		return nil, status.Errorf(codes.NotFound, "order not found: %v", err)
	}

	resp := &order.GetOrderByIDResponse{
		OrderId:            orderModel.ID.String(),
		CustomerId:         orderModel.CustomerID.String(),
		ServiceId:          orderModel.ServiceID.String(),
		Description:        orderModel.Description,
		Location:           orderModel.Location,
		ScheduledStartTime: orderModel.ScheduledStartTime.Format(time.RFC3339),
		ScheduledEndTime:   orderModel.ScheduledEndTime.Format(time.RFC3339),
		Status:             order.OrderStatus(orderModel.Status),
		CreatedAt:          orderModel.CreatedAt.Format(time.RFC3339),
		UpdatedAt:          orderModel.UpdatedAt.Format(time.RFC3339),
	}

	c.logger.Info("order fetched successfully for admin", zap.String("order_id", orderModel.ID.String()))
	return resp, nil
}

func (c *Controller) CancelOrder(ctx context.Context, req *order.CancelOrderRequest) (*order.CancelOrderResponse, error) {
	c.logger.Info("CancelOrder called", zap.String("order_id", req.OrderId), zap.String("user_id", req.UserId))

	orderID, err := uuid.Parse(req.OrderId)
	if err != nil {
		c.logger.Error("invalid order_id", zap.String("order_id", req.OrderId), zap.Error(err))
		return nil, status.Errorf(codes.NotFound, "failed to parse order uuid: %v", err)
	}

	userID, err := uuid.Parse(req.UserId)
	if err != nil {
		c.logger.Error("invalid user_id", zap.String("user_id", req.UserId), zap.Error(err))
		return nil, status.Errorf(codes.NotFound, "failed to parse user uuid: %v", err)
	}

	if err := c.repo.CancelOrder(ctx, orderID, userID); err != nil {
		c.logger.Error("failed to cancel order", zap.String("order_id", req.OrderId), zap.Error(err))
		return nil, status.Errorf(codes.NotFound, "failed to cancel user order: %v", err)
	}

	return &order.CancelOrderResponse{
		Success: true,
		Message: "Order cancelled successfully",
	}, nil
}

func (c *Controller) UpdateOrderStatus(ctx context.Context, req *order.UpdateOrderStatusRequest) (*order.UpdateOrderStatusResponse, error) {
	c.logger.Info("UpdateOrderStatus called", zap.String("order_id", req.OrderId), zap.String("status", req.Status.String()))

	orderID, err := uuid.Parse(req.OrderId)
	if err != nil {
		c.logger.Error("invalid order_id", zap.String("order_id", req.OrderId), zap.Error(err))
		return nil, status.Errorf(codes.InvalidArgument, "invalid order_id: %v", err)
	}
	if err := c.repo.UpdateOrderStatus(ctx, orderID, statusToInt(req.Status)); err != nil {
		c.logger.Error("failed to update order status", zap.String("order_id", req.OrderId), zap.Error(err))
		return nil, status.Errorf(codes.NotFound, "failed to update order status: %v", err)
	}

	return &order.UpdateOrderStatusResponse{
		Success: true,
		Message: "Order status updated successfully",
	}, nil
}

func (c *Controller) ListOrders(ctx context.Context, req *order.ListOrdersRequest) (*order.ListOrdersResponse, error) {
	c.logger.Info("ListOrders called", zap.Int32("limit", req.Limit), zap.Int32("offset", req.Offset))

	orders, totalCount, err := c.repo.ListOrders(ctx, req.Limit, req.Offset)
	if err != nil {
		c.logger.Error("failed to list orders", zap.Error(err))
		return nil, status.Errorf(codes.Internal, "failed to list orders: %v", err)
	}

	respOrders := make([]*order.GetOrderResponse, len(orders))
	for i, o := range orders {
		respOrders[i] = &order.GetOrderResponse{
			OrderId:            o.ID.String(),
			CustomerId:         o.CustomerID.String(),
			ServiceId:          o.ServiceID.String(),
			Description:        o.Description,
			Location:           o.Location,
			ScheduledStartTime: o.ScheduledStartTime.Format(time.RFC3339),
			ScheduledEndTime:   o.ScheduledEndTime.Format(time.RFC3339),
			Status:             order.OrderStatus(o.Status),
			CreatedAt:          o.CreatedAt.Format(time.RFC3339),
			UpdatedAt:          o.UpdatedAt.Format(time.RFC3339),
		}
	}

	resp := &order.ListOrdersResponse{
		Orders:     respOrders,
		TotalCount: totalCount,
		Limit:      req.Limit,
		Offset:     req.Offset,
	}

	c.logger.Info("orders listed successfully", zap.Int("count", len(respOrders)))
	return resp, nil
}

func (c *Controller) ListMyOrders(ctx context.Context, req *order.ListMyOrdersRequest) (*order.ListMyOrdersResponse, error) {
	c.logger.Info("ListMyOrders called", zap.String("customer_id", req.CustomerId))

	customerID, err := uuid.Parse(req.CustomerId)
	if err != nil {
		c.logger.Error("invalid customer_id", zap.String("customer_id", req.CustomerId), zap.Error(err))
		return nil, status.Errorf(codes.InvalidArgument, "invalid customer_id: %v", err)
	}
	if req.Limit == 0 {
		req.Limit = 5
	}

	orders, totalCount, err := c.repo.ListMyOrders(ctx, customerID, req.Limit, req.Offset)
	if err != nil {
		c.logger.Error("failed to fetch my orders", zap.String("customer_id", req.CustomerId), zap.Error(err))
		return nil, status.Errorf(codes.Internal, "failed to fetch my orders: %v", err)
	}

	resp := &order.ListMyOrdersResponse{
		Orders:     make([]*order.GetOrderResponse, len(orders)),
		TotalCount: totalCount,
		Limit:      req.Limit,
		Offset:     req.Offset,
	}

	for i, o := range orders {
		resp.Orders[i] = &order.GetOrderResponse{
			OrderId:            o.ID.String(),
			CustomerId:         o.CustomerID.String(),
			ServiceId:          o.ServiceID.String(),
			Description:        o.Description,
			Location:           o.Location,
			ScheduledStartTime: o.ScheduledStartTime.Format(time.RFC3339),
			ScheduledEndTime:   o.ScheduledEndTime.Format(time.RFC3339),
			Status:             order.OrderStatus(o.Status),
			CreatedAt:          o.CreatedAt.Format(time.RFC3339),
			UpdatedAt:          o.UpdatedAt.Format(time.RFC3339),
		}
	}

	c.logger.Info("my orders fetched successfully", zap.String("customer_id", req.CustomerId), zap.Int("count", len(orders)))
	return resp, nil
}

func statusToInt(status order.OrderStatus) int {
	switch status {
	case order.OrderStatus_PENDING:
		return 1
	case order.OrderStatus_CONFIRMED:
		return 2
	case order.OrderStatus_DONE:
		return 3
	case order.OrderStatus_CANCELED:
		return 4
	default:
		return 0
	}
}
