package migrations

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/order-service/config"
	"go.uber.org/zap"
)

func RunMigrations(cfg *config.Config, log *zap.Logger) error {
	if !cfg.Postgres.RunMigrations {
		log.Info("RunMigrations flag is false, skipping migrations")
		return nil
	}

	migrationPath := cfg.Postgres.MigrationsPath
	migrationsTable := "schema_migrations"
	dsn := fmt.Sprintf(
		"postgres://%s:%s@%s:%d/%s?sslmode=disable",
		cfg.Postgres.User,
		cfg.Postgres.Password,
		cfg.Postgres.Host,
		cfg.Postgres.Port,
		cfg.Postgres.DataBase,
	)
	dsnWithMigrations := dsn + "&x-migrations-table=" + migrationsTable

	maxAttempts := cfg.Postgres.MaxConnectRetry
	wait := 5 * time.Second

	var lastErr error
	for attempt := 1; attempt <= maxAttempts; attempt++ {
		log.Info(fmt.Sprintf("Migration attempt %d/%d", attempt, maxAttempts))

		m, err := migrate.New(migrationPath, dsnWithMigrations)
		if err != nil {
			lastErr = fmt.Errorf("failed to create migrate instance: %w", err)
			log.Warn("Migration instance creation failed, retrying...", zap.Error(lastErr))
		} else {
			err = m.Up()
			if err != nil && !errors.Is(err, migrate.ErrNoChange) {
				lastErr = fmt.Errorf("failed to apply migrations: %w", err)
				log.Warn("Migration up failed, retrying...", zap.Error(lastErr))
			} else {
				log.Info("Migrations applied successfully")
				return nil
			}
		}

		time.Sleep(wait)
	}

	log.Error("Failed to run migrations after retries", zap.Error(lastErr))
	return lastErr
}
