package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"

	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/api-gateway/config"
	analitic_client "github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/api-gateway/internal/clients/analitic"
	client_content "github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/api-gateway/internal/clients/content"
	location_client "github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/api-gateway/internal/clients/location"
	order_clinet "github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/api-gateway/internal/clients/order"
	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/api-gateway/internal/controller/http"
	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/api-gateway/internal/repository/store"
	"go.uber.org/zap"
)

func main() {
	log, err := zap.NewProduction()
	if err != nil {
		panic(err)
	}
	defer log.Sync()

	log.Info("Starting API Gateway...")

	cfg, err := config.New()
	if err != nil {
		log.Fatal("failed to load config", zap.Error(err))
	}
	log.Info("cfg:", zap.Any("port:", cfg.APIGateway.Port))
	log.Info("Configuration loaded successfully")

	contentCli, err := client_content.New(
		context.Background(),
		log,
		cfg,
	)
	if err != nil {
		log.Fatal("failed to create content client", zap.Error(err))
	}
	log.Info("Content client created successfully")

	orderClinet, err := order_clinet.New(
		context.Background(),
		log,
		cfg,
	)

	analyticClient, err := analitic_client.New(
		context.Background(),
		log,
		cfg,
	)

	locationClient, err := location_client.New(
		context.Background(),
		log,
		cfg,
	)

	repo, err := store.New(log, cfg)
	if err != nil {
		log.Fatal("failed to create repository", zap.Error(err))

	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	serv, err := http.New(ctx, cfg, log, contentCli, orderClinet, analyticClient, locationClient, repo)
	if err != nil {
		log.Fatal("failed to create HTTP server", zap.Error(err))
	}
	log.Info("HTTP server initialized successfully")

	go func() {
		if err := serv.Start(); err != nil {
			log.Fatal("failed to start HTTP server", zap.Error(err))
		}
	}()
	log.Info("HTTP server started")

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit

	log.Info("Shutting down API Gateway...")
	log.Info("API Gateway stopped gracefully")
}
