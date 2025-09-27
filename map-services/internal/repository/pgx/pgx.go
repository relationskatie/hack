package pgx

import (
	"github.com/jackc/pgx/v5/pgxpool"
	"go.uber.org/zap"
)

type MapRepository struct {
	logger *zap.Logger
	db     *pgxpool.Pool
}

func New(log *zap.Logger, pool *pgxpool.Pool) (*MapRepository, error) {
	return &MapRepository{
		logger: log.Named("repository"),
		db:     pool,
	}, nil
}
