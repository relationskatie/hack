package main

import (
	"context"
	"log"
	"net"
	"os"
	"os/signal"
	"syscall"

	"go.uber.org/zap"

	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/order-service/config"
	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/order-service/internal/controller/grpc"
	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/order-service/internal/migrations"
	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/order-service/internal/repository/pgx"
	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/order-service/pkg/postgres"
)

func main() {
	cfg, err := config.New()
	if err != nil {
		panic(err)
	}

	logger, err := zap.NewProduction()
	if err != nil {
		panic(err)
	}
	defer logger.Sync()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	if err := migrations.RunMigrations(cfg, logger); err != nil {
		log.Fatal("failed to run migrations:", err)
	}

	psql, err := postgres.NewClient(ctx, cfg, logger)
	if err != nil {
		log.Fatal("failed to connect to postgres:", err)
	}

	repo, err := pgx.New(logger, psql)
	if err != nil {
		log.Fatal("failed to create to store:", err)
	}
	ctrl := grpc.New(ctx, cfg, logger, repo)

	addr := ":50053"
	lis, err := net.Listen("tcp", addr)
	if err != nil {
		logger.Fatal("failed to listen", zap.String("address", addr), zap.Error(err))
	}

	logger.Info("gRPC server starting...", zap.String("address", addr))
	go func() {
		if err := ctrl.GRPCServer().Serve(lis); err != nil {
			logger.Fatal("failed to serve gRPC", zap.Error(err))
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down gRPC server...")
	ctrl.GRPCServer().GracefulStop()
	logger.Info("gRPC server stopped gracefully")
}
