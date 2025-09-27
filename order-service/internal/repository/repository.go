package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/order-service/internal/repository/models"
)

type Repository interface {
	CreateService(ctx context.Context, s models.Service) error
	GetServiceByID(ctx context.Context, serviceID uuid.UUID) (*models.Service, error)
	UpdateService(ctx context.Context, s models.Service) error
	ListServices(ctx context.Context, limit, offset int) ([]models.Service, int, error)
	DeleteService(ctx context.Context, serviceID uuid.UUID) error

	CreateOrder(ctx context.Context, order models.Order, needSchedule bool) error
	GetOrder(ctx context.Context, orderID uuid.UUID, userID uuid.UUID) (*models.Order, error)
	GetOrderByID(ctx context.Context, orderID uuid.UUID) (*models.Order, error)
	CancelOrder(ctx context.Context, orderID, userID uuid.UUID) error
	UpdateOrderStatus(ctx context.Context, orderID uuid.UUID, status int) error
	ListOrders(ctx context.Context, limit, offset int32) ([]*models.Order, int32, error)
	ListMyOrders(ctx context.Context, customerID uuid.UUID, limit, offset int32) ([]*models.Order, int32, error)
}
