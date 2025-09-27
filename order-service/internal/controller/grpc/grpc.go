package grpc

import (
	"context"

	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/order-service/config"
	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/order-service/internal/repository"
	order "github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/order-service/proto"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

type Controller struct {
	ctx        context.Context
	logger     *zap.Logger
	cfg        *config.Config
	repo       repository.Repository
	gRPCServer *grpc.Server
	order.UnimplementedOrderServiceServer
}

func New(ctx context.Context, cfg *config.Config, logger *zap.Logger, repo repository.Repository) *Controller {
	ctrl := &Controller{
		ctx:    ctx,
		cfg:    cfg,
		logger: logger,
		repo:   repo,
	}

	ctrl.gRPCServer = grpc.NewServer()

	order.RegisterOrderServiceServer(ctrl.gRPCServer, ctrl)

	return ctrl
}

func (c *Controller) GRPCServer() *grpc.Server {
	return c.gRPCServer
}
