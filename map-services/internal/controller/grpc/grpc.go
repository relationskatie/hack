package grpc

import (
	"context"

	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/map-services/config"
	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/map-services/internal/repository"
	location "github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/map-services/proto"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

type Controller struct {
	ctx        context.Context
	logger     *zap.Logger
	cfg        *config.Config
	repo       repository.MapRepository
	gRPCServer *grpc.Server
	location.UnimplementedItemServiceServer
}

func New(ctx context.Context, cfg *config.Config, logger *zap.Logger, repo repository.MapRepository) *Controller {
	ctrl := &Controller{
		ctx:    ctx,
		cfg:    cfg,
		logger: logger,
		repo:   repo,
	}

	ctrl.gRPCServer = grpc.NewServer()

	location.RegisterItemServiceServer(ctrl.gRPCServer, ctrl)

	return ctrl
}

func (c *Controller) GRPCServer() *grpc.Server {
	return c.gRPCServer
}
