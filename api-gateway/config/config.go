package config

import (
	"log"

	"github.com/ilyakaznacheev/cleanenv"
)

type Config struct {
	APIGateway      *APIGateway      `json:"api_gateway"`
	ContentService  *ContentService  `json:"content_service"`
	OrderService    *OrderService    `json:"order_service"`
	AnaliticService *AnaliticService `json:"analitic_service"`
	LocationService *LocationService `json:"location_service"`
}

func New() (*Config, error) {
	cfg := &Config{
		APIGateway: &APIGateway{
			Host: "0.0.0.0",
			Port: 861,
			Env:  "dev",
		},
		ContentService: &ContentService{
			Host: "0.0.0.0",
			Port: 50051,
		},
		OrderService: &OrderService{
			Host: "0.0.0.0",
			Port: 50053,
		},
		AnaliticService: &AnaliticService{
			Host: "0.0.0.0",
			Port: 50052,
		},
		LocationService: &LocationService{
			Host: "0.0.0.0",
			Port: 50054,
		},
	}

	if err := cleanenv.ReadConfig("./config.json", cfg); err != nil {
		log.Fatalf("Failed to read config.json: %v", err)
	}
	return cfg, nil
}
