package location_client

import (
	"context"
	"fmt"

	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/api-gateway/config"
	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/api-gateway/proto/location"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type Client struct {
	cfg *config.Config
	api location.ItemServiceClient
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

	addr := fmt.Sprintf("%s:%d", cfg.LocationService.Host, cfg.LocationService.Port)
	conn, err := grpc.DialContext(ctx, addr, opts...)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to %s: %w", addr, err)
	}

	return &Client{
		cfg: cfg,
		api: location.NewItemServiceClient(conn),
		log: log,
		ctx: ctx,
	}, nil
}

type Location interface {
	CreateItem(title, status, typ string) (*location.Item, error)
	GetItem(id int64) (*location.Item, error)
	UpdateItem(id int64, title, status, typ string) (*location.Item, error)
	DeleteItem(id int64) error
	ListItems() ([]*location.Item, error)

	CreateTrafficLight(address, typ string, year int32) (*location.TrafficLight, error)
	GetTrafficLight(id int64) (*location.TrafficLight, error)
	UpdateTrafficLight(id int64, address, typ string, year int32) (*location.TrafficLight, error)
	DeleteTrafficLight(id int64) error
	ListTrafficLights() ([]*location.TrafficLight, error)
}

func (c *Client) CreateItem(title, status, typ string) (*location.Item, error) {
	resp, err := c.api.CreateItem(c.ctx, &location.CreateItemRequest{
		Title:  title,
		Status: status,
		Type:   typ,
	})
	if err != nil {
		c.log.Error("CreateItem failed", zap.Error(err))
		return nil, err
	}
	return resp.Item, nil
}

func (c *Client) GetItem(id int64) (*location.Item, error) {
	resp, err := c.api.GetItem(c.ctx, &location.GetItemRequest{Id: id})
	if err != nil {
		c.log.Error("GetItem failed", zap.Error(err))
		return nil, err
	}
	return resp.Item, nil
}

func (c *Client) UpdateItem(id int64, title, status, typ string) (*location.Item, error) {
	resp, err := c.api.UpdateItem(c.ctx, &location.UpdateItemRequest{
		Id:     id,
		Title:  title,
		Status: status,
		Type:   typ,
	})
	if err != nil {
		c.log.Error("UpdateItem failed", zap.Error(err))
		return nil, err
	}
	return resp.Item, nil
}

func (c *Client) DeleteItem(id int64) error {
	_, err := c.api.DeleteItem(c.ctx, &location.DeleteItemRequest{Id: id})
	if err != nil {
		c.log.Error("DeleteItem failed", zap.Error(err))
	}
	return err
}

func (c *Client) ListItems() ([]*location.Item, error) {
	resp, err := c.api.ListItems(c.ctx, &location.ListItemsRequest{})
	if err != nil {
		c.log.Error("ListItems failed", zap.Error(err))
		return nil, err
	}
	return resp.Items, nil
}

func (c *Client) CreateTrafficLight(address, typ string, year int32) (*location.TrafficLight, error) {
	resp, err := c.api.CreateTrafficLight(c.ctx, &location.CreateTrafficLightRequest{
		Address:          address,
		Type:             typ,
		YearInstallation: year,
	})
	if err != nil {
		c.log.Error("CreateTrafficLight failed", zap.Error(err))
		return nil, err
	}
	return resp.TrafficLight, nil
}

func (c *Client) GetTrafficLight(id int64) (*location.TrafficLight, error) {
	resp, err := c.api.GetTrafficLight(c.ctx, &location.GetTrafficLightRequest{Id: id})
	if err != nil {
		c.log.Error("GetTrafficLight failed", zap.Error(err))
		return nil, err
	}
	return resp.TrafficLight, nil
}

func (c *Client) UpdateTrafficLight(id int64, address, typ string, year int32) (*location.TrafficLight, error) {
	resp, err := c.api.UpdateTrafficLight(c.ctx, &location.UpdateTrafficLightRequest{
		Id:               id,
		Address:          address,
		Type:             typ,
		YearInstallation: year,
	})
	if err != nil {
		c.log.Error("UpdateTrafficLight failed", zap.Error(err))
		return nil, err
	}
	return resp.TrafficLight, nil
}

func (c *Client) DeleteTrafficLight(id int64) error {
	_, err := c.api.DeleteTrafficLight(c.ctx, &location.DeleteTrafficLightRequest{Id: id})
	if err != nil {
		c.log.Error("DeleteTrafficLight failed", zap.Error(err))
	}
	return err
}

func (c *Client) ListTrafficLights() ([]*location.TrafficLight, error) {
	resp, err := c.api.ListTrafficLights(c.ctx, &location.ListTrafficLightsRequest{})
	if err != nil {
		c.log.Error("ListTrafficLights failed", zap.Error(err))
		return nil, err
	}
	return resp.TrafficLights, nil
}
