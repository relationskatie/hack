package pgx

import (
	"github.com/jackc/pgx/v5/pgxpool"
	"go.uber.org/zap"
)

type OrderRepository struct {
	logger *zap.Logger
	db     *pgxpool.Pool
}

func New(log *zap.Logger, pool *pgxpool.Pool) (*OrderRepository, error) {
	return &OrderRepository{
		logger: log.Named("repository"),
		db:     pool,
	}, nil
}
