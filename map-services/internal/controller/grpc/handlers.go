package grpc

import (
	"context"

	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/map-services/internal/repository/models"
	location "github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/map-services/proto"
	"go.uber.org/zap"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (ctrl *Controller) CreateItem(ctx context.Context, req *location.CreateItemRequest) (*location.CreateItemResponse, error) {
	if req.GetTitle() == "" {
		return nil, status.Error(codes.InvalidArgument, "title is required")
	}

	id, err := ctrl.repo.CreateItem(ctx, models.Item{
		Title:  req.GetTitle(),
		Status: req.GetStatus(),
		Type:   req.GetType(),
	})
	if err != nil {
		ctrl.logger.Error("failed to create item", zap.Error(err))
		return nil, status.Error(codes.Internal, "failed to create item")
	}

	return &location.CreateItemResponse{
		Item: &location.Item{
			Id:     id,
			Title:  req.GetTitle(),
			Status: req.GetStatus(),
			Type:   req.GetType(),
		},
	}, nil
}

func (ctrl *Controller) GetItem(ctx context.Context, req *location.GetItemRequest) (*location.GetItemResponse, error) {
	if req.GetId() == 0 {
		return nil, status.Error(codes.InvalidArgument, "id is required")
	}

	item, err := ctrl.repo.GetItem(ctx, req.GetId())
	if err != nil {
		ctrl.logger.Error("failed to get item", zap.Int64("id", req.GetId()), zap.Error(err))
		return nil, status.Error(codes.Internal, "failed to get item")
	}

	return &location.GetItemResponse{
		Item: &location.Item{
			Id:     item.ID,
			Title:  item.Title,
			Status: item.Status,
			Type:   item.Type,
		},
	}, nil
}

func (ctrl *Controller) UpdateItem(ctx context.Context, req *location.UpdateItemRequest) (*location.UpdateItemResponse, error) {
	if req.GetId() == 0 {
		return nil, status.Error(codes.InvalidArgument, "id is required")
	}

	item := models.Item{
		ID:     req.GetId(),
		Title:  req.GetTitle(),
		Status: req.GetStatus(),
		Type:   req.GetType(),
	}

	err := ctrl.repo.UpdateItem(ctx, item)
	if err != nil {
		ctrl.logger.Error("failed to update item", zap.Int64("id", req.GetId()), zap.Error(err))
		return nil, status.Error(codes.Internal, "failed to update item")
	}

	return &location.UpdateItemResponse{
		Item: &location.Item{
			Id:     req.Id,
			Title:  req.Title,
			Status: req.Status,
			Type:   req.Type,
		},
	}, nil
}

func (ctrl *Controller) DeleteItem(ctx context.Context, req *location.DeleteItemRequest) (*location.DeleteItemResponse, error) {
	if req.GetId() == 0 {
		return nil, status.Error(codes.InvalidArgument, "id is required")
	}

	err := ctrl.repo.DeleteItem(ctx, req.GetId())
	if err != nil {
		ctrl.logger.Error("failed to delete item", zap.Int64("id", req.GetId()), zap.Error(err))
		return nil, status.Error(codes.Internal, "failed to delete item")
	}

	return &location.DeleteItemResponse{
		Success: true,
	}, nil
}

func (ctrl *Controller) ListItems(ctx context.Context, req *location.ListItemsRequest) (*location.ListItemsResponse, error) {
	items, err := ctrl.repo.ListItems(ctx)
	if err != nil {
		ctrl.logger.Error("failed to list items", zap.Error(err))
		return nil, status.Error(codes.Internal, "failed to list items")
	}

	respItems := make([]*location.Item, 0, len(items))
	for _, i := range items {
		respItems = append(respItems, &location.Item{
			Id:     i.ID,
			Title:  i.Title,
			Status: i.Status,
			Type:   i.Type,
		})
	}

	return &location.ListItemsResponse{
		Items: respItems,
	}, nil
}

func (ctrl *Controller) CreateTrafficLight(ctx context.Context, req *location.CreateTrafficLightRequest) (*location.CreateTrafficLightResponse, error) {
	if req.GetAddress() == "" {
		return nil, status.Error(codes.InvalidArgument, "address is required")
	}

	id, err := ctrl.repo.CreateTrafficLight(ctx, models.TrafficLight{
		Address:          req.GetAddress(),
		Type:             req.GetType(),
		YearInstallation: req.GetYearInstallation(),
	})
	if err != nil {
		ctrl.logger.Error("failed to create traffic light", zap.Error(err))
		return nil, status.Error(codes.Internal, "failed to create traffic light")
	}

	return &location.CreateTrafficLightResponse{
		TrafficLight: &location.TrafficLight{
			Id:               id,
			Address:          req.GetAddress(),
			Type:             req.GetType(),
			YearInstallation: req.GetYearInstallation(),
		},
	}, nil
}

func (ctrl *Controller) GetTrafficLight(ctx context.Context, req *location.GetTrafficLightRequest) (*location.GetTrafficLightResponse, error) {
	tl, err := ctrl.repo.GetTrafficLight(ctx, req.GetId())
	if err != nil {
		ctrl.logger.Error("failed to get traffic light", zap.Error(err))
		return nil, status.Error(codes.NotFound, "traffic light not found")
	}

	return &location.GetTrafficLightResponse{
		TrafficLight: &location.TrafficLight{
			Id:               tl.ID,
			Address:          tl.Address,
			Type:             tl.Type,
			YearInstallation: tl.YearInstallation,
		},
	}, nil
}

func (ctrl *Controller) UpdateTrafficLight(ctx context.Context, req *location.UpdateTrafficLightRequest) (*location.UpdateTrafficLightResponse, error) {
	tl := models.TrafficLight{
		ID:               req.GetId(),
		Address:          req.GetAddress(),
		Type:             req.GetType(),
		YearInstallation: req.GetYearInstallation(),
	}

	if err := ctrl.repo.UpdateTrafficLight(ctx, tl); err != nil {
		ctrl.logger.Error("failed to update traffic light", zap.Error(err))
		return nil, status.Error(codes.Internal, "failed to update traffic light")
	}

	return &location.UpdateTrafficLightResponse{
		TrafficLight: &location.TrafficLight{
			Id:               tl.ID,
			Address:          tl.Address,
			Type:             tl.Type,
			YearInstallation: tl.YearInstallation,
		},
	}, nil
}

func (ctrl *Controller) DeleteTrafficLight(ctx context.Context, req *location.DeleteTrafficLightRequest) (*location.DeleteTrafficLightResponse, error) {
	if err := ctrl.repo.DeleteTrafficLight(ctx, req.GetId()); err != nil {
		ctrl.logger.Error("failed to delete traffic light", zap.Error(err))
		return &location.DeleteTrafficLightResponse{Success: false}, status.Error(codes.Internal, "failed to delete traffic light")
	}

	return &location.DeleteTrafficLightResponse{Success: true}, nil
}

func (ctrl *Controller) ListTrafficLights(ctx context.Context, req *location.ListTrafficLightsRequest) (*location.ListTrafficLightsResponse, error) {
	tls, err := ctrl.repo.ListTrafficLights(ctx)
	if err != nil {
		ctrl.logger.Error("failed to list traffic lights", zap.Error(err))
		return nil, status.Error(codes.Internal, "failed to list traffic lights")
	}

	var resp []*location.TrafficLight
	for _, tl := range tls {
		resp = append(resp, &location.TrafficLight{
			Id:               tl.ID,
			Address:          tl.Address,
			Type:             tl.Type,
			YearInstallation: tl.YearInstallation,
		})
	}

	return &location.ListTrafficLightsResponse{
		TrafficLights: resp,
	}, nil
}
