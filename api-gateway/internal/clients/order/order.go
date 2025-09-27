package order_clinet

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/api-gateway/config"
	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/api-gateway/internal/controller/models"
	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/api-gateway/proto/order"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type Order interface {
	CreateService(req models.CreateServiceRequest) (*models.CreateServiceResponse, error)
	UpdateServices(req models.UpdateServiceDTO) (*models.UpdateServiceResponse, error)
	DeleteServices(id string) (*models.DeleteServicesResponse, error)
	GetServicesByID(id string) (*models.GetServicesByIDResponse, error)
	ListServices(req models.ListServicesRequest) (*models.ListServicesResponse, error)

	CreateOrder(req models.CreateOrderDTO) (*models.CreateOrderResponse, error)
	GetOrderForUser(customerID string, orderID string) (*models.OrderForUserResponse, error)
	GetOrderByID(orderID string) (*models.OrderForUserResponse, error)
	CancelOrder(orderID, userID string) (*models.CancelOrderResponse, error)
	UpdateOrderStatus(req models.UpdateOrderStatusRequest) (*models.UpdateOrderStatusResponse, error)
	ListOrders(req models.ListOrdersRequest) (*models.ListOrdersResponse, error)
	ListMyOrders(customerID string, limit, offset int32) (*models.ListMyOrdersResponse, error)
}

type Client struct {
	cfg *config.Config
	api order.OrderServiceClient
	log *zap.Logger
	ctx context.Context
}

func New(
	ctx context.Context,
	log *zap.Logger,
	cfg *config.Config,
) (*Client, error) {
	opts := []grpc.DialOption{
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithBlock(),
	}

	addr := fmt.Sprintf("%s:%d", cfg.OrderService.Host, cfg.OrderService.Port)
	conn, err := grpc.DialContext(ctx, addr, opts...)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to %s: %w", addr, err)
	}

	return &Client{
		api: order.NewOrderServiceClient(conn),
		log: log,
		ctx: ctx,
		cfg: cfg,
	}, nil
}

func (c *Client) CreateService(req models.CreateServiceRequest) (*models.CreateServiceResponse, error) {
	slots := make([]*order.TimeSlot, len(req.Schedule))
	for i, s := range req.Schedule {
		slots[i] = &order.TimeSlot{
			StartTime: s.StartTime,
			EndTime:   s.EndTime,
			IsBooked:  s.IsBooked,
			Date:      s.Date,
		}
	}

	grpcReq := &order.CreateServiceRequest{
		Tittle:       req.Tittle,
		Price:        req.Price,
		Description:  req.Description,
		NeedSchedule: req.NeedSchedule,
		Schedule:     slots,
	}

	resp, err := c.api.CreateService(c.ctx, grpcReq)
	if err != nil {
		return nil, err
	}

	serviceSlots := make([]models.TimeSlot, len(resp.Service.Schedule))
	for i, s := range resp.Service.Schedule {
		serviceSlots[i] = models.TimeSlot{
			StartTime: s.StartTime,
			EndTime:   s.EndTime,
			IsBooked:  s.IsBooked,
			Date:      s.Date,
		}
	}

	serviceResp := &models.CreateServiceResponse{
		Service: models.ServiceInfo{
			ID:           resp.Service.Id,
			Tittle:       resp.Service.Tittle,
			Price:        resp.Service.Price,
			Description:  resp.Service.Description,
			NeedSchedule: resp.Service.NeedSchedule,
			Schedule:     serviceSlots,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		},
	}

	return serviceResp, nil
}

func (c *Client) UpdateServices(req models.UpdateServiceDTO) (*models.UpdateServiceResponse, error) {
	if _, err := uuid.Parse(req.ServiceID); err != nil {
		return nil, err
	}

	grpcReq := &order.UpdateServiceRequest{
		ServiceId:   req.ServiceID,
		Tittle:      req.Tittle,
		Price:       req.Price,
		Description: req.Description,
	}

	resp, err := c.api.UpdateService(c.ctx, grpcReq)
	if err != nil {
		return nil, err
	}

	return &models.UpdateServiceResponse{
		Message:   resp.Message,
		UpdatedAt: time.Now(),
	}, nil
}

func (c *Client) DeleteServices(id string) (*models.DeleteServicesResponse, error) {
	if _, err := uuid.Parse(id); err != nil {
		return nil, err
	}

	req := &order.DeleteServiceRequest{
		ServiceId: id,
	}

	resp, err := c.api.DeleteService(c.ctx, req)
	if err != nil {
		return nil, err
	}

	return &models.DeleteServicesResponse{
		Success: resp.Success,
		Message: resp.Message,
	}, nil
}

func (c *Client) GetServicesByID(id string) (*models.GetServicesByIDResponse, error) {
	if _, err := uuid.Parse(id); err != nil {
		return nil, fmt.Errorf("invalid service id: %v", err)
	}

	grpcReq := &order.GetServiceRequest{
		ServiceId: id,
	}

	resp, err := c.api.GetService(c.ctx, grpcReq)
	if err != nil {
		return nil, fmt.Errorf("failed to get service by id: %v", err)
	}

	serviceResp := &models.GetServicesByIDResponse{
		ServiceI: models.ServiceI{
			ID:           resp.Service.Id,
			Tittle:       resp.Service.Tittle,
			Price:        resp.Service.Price,
			Description:  resp.Service.Description,
			NeedSchedule: resp.Service.NeedSchedule,
			Schedule:     make([]models.TimeSlot, len(resp.Service.Schedule)),
		},
	}

	for i, slot := range resp.Service.Schedule {
		serviceResp.Schedule[i] = models.TimeSlot{
			StartTime: slot.StartTime[:5],
			EndTime:   slot.EndTime[:5],
			IsBooked:  slot.IsBooked,
			Date:      slot.Date,
		}
	}

	return serviceResp, nil
}

func (c *Client) ListServices(req models.ListServicesRequest) (*models.ListServicesResponse, error) {
	grpcReq := &order.ListServicesRequest{
		Limit:  req.Limit,
		Offset: req.Offset,
	}

	resp, err := c.api.ListServices(c.ctx, grpcReq)
	if err != nil {
		return nil, fmt.Errorf("failed to list services: %v", err)
	}

	services := make([]models.ShortServiceInfo, len(resp.Services))
	for i, s := range resp.Services {
		services[i] = models.ShortServiceInfo{
			ID:           s.Id,
			Tittle:       s.Tittle,
			Price:        s.Price,
			Description:  s.Description,
			NeedSchedule: s.NeedSchedule,
		}
	}

	return &models.ListServicesResponse{
		Services:   services,
		TotalCount: resp.TotalCount,
		Limit:      req.Limit,
		Offset:     req.Offset,
	}, nil
}

func (c *Client) CreateOrder(req models.CreateOrderDTO) (*models.CreateOrderResponse, error) {
	grpcReq := &order.CreateOrderRequest{
		CustomerId:         req.CustomerID,
		ServiceId:          req.ServiceID,
		Description:        req.Description,
		Location:           req.Location,
		ScheduledStartTime: req.StartTime,
		ScheduledEndTime:   req.EndTime,
		Date:               req.Date,
	}

	resp, err := c.api.CreateOrder(c.ctx, grpcReq)
	if err != nil {
		return nil, fmt.Errorf("failed to create order: %v", err)
	}

	service := models.ShortServiceInfo{
		ID:           resp.Service.Id,
		Tittle:       resp.Service.Tittle,
		Price:        resp.Service.Price,
		Description:  resp.Service.Description,
		NeedSchedule: resp.Service.NeedSchedule,
	}

	return &models.CreateOrderResponse{
		OrderID:   resp.OrderId,
		Service:   service,
		Status:    resp.Status.String(),
		CreatedAt: resp.CreatedAt,
	}, nil
}

func (c *Client) GetOrderForUser(customerID string, orderID string) (*models.OrderForUserResponse, error) {
	req := &order.GetOrderRequest{
		CustomerId: customerID,
		OrderId:    orderID,
	}

	resp, err := c.api.GetOrder(c.ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to get order: %v", err)
	}

	formatTime := func(ts string) string {
		t, err := time.Parse(time.RFC3339, ts)
		if err != nil {
			return ts
		}
		return t.Format("15.04")
	}

	orderResp := &models.OrderForUserResponse{
		OrderID:            resp.OrderId,
		CustomerID:         resp.CustomerId,
		ServiceID:          resp.ServiceId,
		Description:        resp.Description,
		Location:           resp.Location,
		ScheduledStartTime: formatTime(resp.ScheduledStartTime),
		ScheduledEndTime:   formatTime(resp.ScheduledEndTime),
		Status:             resp.Status.String(),
		CreatedAt:          resp.CreatedAt,
		UpdatedAt:          resp.UpdatedAt,
	}

	return orderResp, nil
}

func (c *Client) GetOrderByID(orderID string) (*models.OrderForUserResponse, error) {
	req := &order.GetOrderByIDRequest{
		OrderId: orderID,
	}

	resp, err := c.api.GetOrderByID(c.ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to get order by ID: %v", err)
	}

	formatTime := func(ts string) string {
		t, err := time.Parse(time.RFC3339, ts)
		if err != nil {
			return ts
		}
		return t.Format("15.04")
	}

	return &models.OrderForUserResponse{
		OrderID:            resp.OrderId,
		CustomerID:         resp.CustomerId,
		ServiceID:          resp.ServiceId,
		Description:        resp.Description,
		Location:           resp.Location,
		ScheduledStartTime: formatTime(resp.ScheduledStartTime),
		ScheduledEndTime:   formatTime(resp.ScheduledEndTime),
		Status:             resp.Status.String(),
		CreatedAt:          resp.CreatedAt,
		UpdatedAt:          resp.UpdatedAt,
	}, nil
}

func (c *Client) CancelOrder(orderID, userID string) (*models.CancelOrderResponse, error) {
	if _, err := uuid.Parse(orderID); err != nil {
		return nil, fmt.Errorf("invalid order_id: %v", err)
	}
	if _, err := uuid.Parse(userID); err != nil {
		return nil, fmt.Errorf("invalid user_id: %v", err)
	}

	grpcReq := &order.CancelOrderRequest{
		OrderId: orderID,
		UserId:  userID,
	}

	resp, err := c.api.CancelOrder(c.ctx, grpcReq)
	if err != nil {
		return nil, fmt.Errorf("failed to cancel order: %v", err)
	}

	return &models.CancelOrderResponse{
		Success: resp.Success,
		Message: resp.Message,
	}, nil
}

func (c *Client) UpdateOrderStatus(req models.UpdateOrderStatusRequest) (*models.UpdateOrderStatusResponse, error) {
	var status order.OrderStatus
	switch req.Status {
	case "PENDING":
		status = order.OrderStatus_PENDING
	case "CONFIRMED":
		status = order.OrderStatus_CONFIRMED
	case "DONE":
		status = order.OrderStatus_DONE
	case "CANCELED":
		status = order.OrderStatus_CANCELED
	default:
		return nil, fmt.Errorf("invalid status: %s", req.Status)
	}

	grpcReq := &order.UpdateOrderStatusRequest{
		OrderId: req.OrderID,
		Status:  status,
	}

	resp, err := c.api.UpdateOrderStatus(c.ctx, grpcReq)
	if err != nil {
		return nil, err
	}

	return &models.UpdateOrderStatusResponse{
		Success: resp.Success,
		Message: resp.Message,
	}, nil
}

func (c *Client) ListOrders(req models.ListOrdersRequest) (*models.ListOrdersResponse, error) {
	grpcReq := &order.ListOrdersRequest{
		Limit:  int32(req.Limit),
		Offset: int32(req.Offset),
	}

	if grpcReq.Limit == 0 {
		grpcReq.Limit = 5
	}

	resp, err := c.api.ListOrders(c.ctx, grpcReq)
	if err != nil {
		return nil, fmt.Errorf("failed to list orders: %v", err)
	}

	formatTime := func(ts string) string {
		t, err := time.Parse(time.RFC3339, ts)
		if err != nil {
			return ts
		}
		return t.Format("15.04")
	}

	orders := make([]models.OrderForUserResponse, len(resp.Orders))
	for i, o := range resp.Orders {
		orders[i] = models.OrderForUserResponse{
			OrderID:            o.OrderId,
			CustomerID:         o.CustomerId,
			ServiceID:          o.ServiceId,
			Description:        o.Description,
			Location:           o.Location,
			ScheduledStartTime: formatTime(o.ScheduledStartTime),
			ScheduledEndTime:   formatTime(o.ScheduledEndTime),
			Status:             o.Status.String(),
			CreatedAt:          o.CreatedAt,
			UpdatedAt:          o.UpdatedAt,
		}
	}

	return &models.ListOrdersResponse{
		Orders:     orders,
		TotalCount: int(resp.TotalCount),
		Limit:      int(resp.Limit),
		Offset:     int(resp.Offset),
	}, nil
}

func (c *Client) ListMyOrders(customerID string, limit, offset int32) (*models.ListMyOrdersResponse, error) {
	req := &order.ListMyOrdersRequest{
		CustomerId: customerID,
		Limit:      limit,
		Offset:     offset,
	}

	resp, err := c.api.ListMyOrders(c.ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to list my orders: %v", err)
	}
	formatTime := func(ts string) string {
		t, err := time.Parse(time.RFC3339, ts)
		if err != nil {
			return ts
		}
		return t.Format("15.04")
	}

	orders := make([]models.OrderForUserResponse, len(resp.Orders))
	for i, o := range resp.Orders {
		orders[i] = models.OrderForUserResponse{
			OrderID:            o.OrderId,
			CustomerID:         o.CustomerId,
			ServiceID:          o.ServiceId,
			Description:        o.Description,
			Location:           o.Location,
			ScheduledStartTime: formatTime(o.ScheduledStartTime),
			ScheduledEndTime:   formatTime(o.ScheduledEndTime),
			Status:             o.Status.String(),
			CreatedAt:          o.CreatedAt,
			UpdatedAt:          o.UpdatedAt,
		}
	}

	return &models.ListMyOrdersResponse{
		Orders:     orders,
		TotalCount: int(resp.TotalCount),
		Limit:      int(resp.Limit),
		Offset:     int(resp.Offset),
	}, nil
}
