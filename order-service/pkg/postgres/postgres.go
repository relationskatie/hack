package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/order-service/config"
	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/order-service/pkg/common"
	"github.com/jackc/pgx/v5/pgxpool"
	"go.uber.org/zap"
)

func NewClient(ctx context.Context, cfg *config.Config, log *zap.Logger) (*pgxpool.Pool, error) {
	var err error
	var conn *pgxpool.Pool

	dsn := getConnectionURL(cfg)

	maxAttempts := cfg.Postgres.MaxConnectRetry
	timeForRetry := cfg.Postgres.TimeToWaitForRetry
	timeForConnection := cfg.Postgres.TimeForConnection

	err = common.DoWithTries(func() error {
		time, cancel := context.WithTimeout(ctx, time.Duration(timeForConnection)*time.Second)
		defer cancel()

		conn, err = pgxpool.New(time, dsn)
		if err != nil {
			return err
		}
		return nil
	}, maxAttempts, time.Duration(timeForRetry)*time.Second)
	if err != nil {
		return nil, err
	}

	return conn, nil

}

func getConnectionURL(cfg *config.Config) string {
	return fmt.Sprintf("postgresql://%s:%s@%s:%d/%s?sslmode=disable",
		cfg.Postgres.User,
		cfg.Postgres.Password,
		cfg.Postgres.Host,
		cfg.Postgres.Port,
		cfg.Postgres.DataBase,
	)
}
