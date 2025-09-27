package repository

import (
	"context"

	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/map-services/internal/repository/models"
)

type MapRepository interface {
	CreateItem(ctx context.Context, item models.Item) (int64, error)
	GetItem(ctx context.Context, id int64) (*models.Item, error)
	UpdateItem(ctx context.Context, item models.Item) error
	DeleteItem(ctx context.Context, id int64) error
	ListItems(ctx context.Context) ([]models.Item, error)

	CreateTrafficLight(ctx context.Context, tl models.TrafficLight) (int64, error)
	GetTrafficLight(ctx context.Context, id int64) (*models.TrafficLight, error)
	UpdateTrafficLight(ctx context.Context, tl models.TrafficLight) error
	DeleteTrafficLight(ctx context.Context, id int64) error
	ListTrafficLights(ctx context.Context) ([]models.TrafficLight, error)
}
