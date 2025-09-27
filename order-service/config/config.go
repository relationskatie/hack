package config

import (
	"log"

	"github.com/ilyakaznacheev/cleanenv"
)

type Postgres struct {
	Host               string `json:"host"`
	Port               int    `json:"port"`
	User               string `json:"user"`
	Password           string `json:"password"`
	DataBase           string `json:"data_base"`
	MaxConnectRetry    int    `json:"max_connect_retry"`
	TimeToWaitForRetry int    `json:"time_to_wait_for_retry"`
	TimeForConnection  int    `json:"time_for_connection"`
	RunMigrations      bool   `json:"run_migrations"`
	MigrationsPath     string `json:"migrations_path"`
}

type Server struct {
	Host string `json:"host"`
	Port int    `json:"port"`
	Env  string `json:"env"`
}

type Config struct {
	Server   *Server   `json:"server"`
	Postgres *Postgres `json:"postgres"`
}

func New() (*Config, error) {
	cfg := &Config{
		Server: &Server{
			Host: "0.0.0.0",
			Port: 500053,
			Env:  "dev",
		},
		Postgres: &Postgres{
			Host:               "postgres_orders",
			Port:               5433,
			User:               "relationskat123",
			Password:           "relations123mu",
			DataBase:           "order_db",
			MaxConnectRetry:    5,
			TimeToWaitForRetry: 5,
			TimeForConnection:  5,
			RunMigrations:      true,
			MigrationsPath:     "file:///usr/src/app/migrations",
		},
	}
	if err := cleanenv.ReadConfig("./config.json", cfg); err != nil {
		log.Fatalf("Failed to read config.json: %v", err)
		return nil, err
	}

	return cfg, nil
}
