package pgx

import (
	"context"

	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/map-services/internal/repository/models"
	"go.uber.org/zap"
)

func (r *MapRepository) CreateItem(ctx context.Context, item models.Item) (int64, error) {
	var id int64
	err := r.db.QueryRow(ctx,
		`INSERT INTO items (title, status, type) VALUES ($1, $2, $3) RETURNING id`,
		item.Title, item.Status, item.Type).Scan(&id)
	if err != nil {
		r.logger.Error("CreateItem failed", zap.Error(err))
		return 0, err
	}
	return id, nil
}

func (r *MapRepository) GetItem(ctx context.Context, id int64) (*models.Item, error) {
	var item models.Item
	err := r.db.QueryRow(ctx,
		`SELECT id, title, status, type FROM items WHERE id=$1`, id).
		Scan(&item.ID, &item.Title, &item.Status, &item.Type)
	if err != nil {
		r.logger.Error("GetItem failed", zap.Error(err))
		return nil, err
	}
	return &item, nil
}

func (r *MapRepository) UpdateItem(ctx context.Context, item models.Item) error {
	_, err := r.db.Exec(ctx,
		`UPDATE items SET title=$1, status=$2, type=$3 WHERE id=$4`,
		item.Title, item.Status, item.Type, item.ID)
	if err != nil {
		r.logger.Error("UpdateItem failed", zap.Error(err))
	}
	return err
}

func (r *MapRepository) DeleteItem(ctx context.Context, id int64) error {
	_, err := r.db.Exec(ctx, `DELETE FROM items WHERE id=$1`, id)
	if err != nil {
		r.logger.Error("DeleteItem failed", zap.Error(err))
	}
	return err
}

func (r *MapRepository) ListItems(ctx context.Context) ([]models.Item, error) {
	rows, err := r.db.Query(ctx, `SELECT id, title, status, type FROM items`)
	if err != nil {
		r.logger.Error("ListItems failed", zap.Error(err))
		return nil, err
	}
	defer rows.Close()

	var items []models.Item
	for rows.Next() {
		var item models.Item
		if err := rows.Scan(&item.ID, &item.Title, &item.Status, &item.Type); err != nil {
			r.logger.Error("ListItems scan failed", zap.Error(err))
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}

func (r *MapRepository) CreateTrafficLight(ctx context.Context, tl models.TrafficLight) (int64, error) {
	var id int64
	err := r.db.QueryRow(ctx,
		`INSERT INTO traffic_lights (address, type, year_installation) VALUES ($1, $2, $3) RETURNING id`,
		tl.Address, tl.Type, tl.YearInstallation).Scan(&id)
	if err != nil {
		r.logger.Error("CreateTrafficLight failed", zap.Error(err))
		return 0, err
	}
	return id, nil
}

func (r *MapRepository) GetTrafficLight(ctx context.Context, id int64) (*models.TrafficLight, error) {
	var tl models.TrafficLight
	err := r.db.QueryRow(ctx,
		`SELECT id, address, type, year_installation FROM traffic_lights WHERE id=$1`, id).
		Scan(&tl.ID, &tl.Address, &tl.Type, &tl.YearInstallation)
	if err != nil {
		r.logger.Error("GetTrafficLight failed", zap.Error(err))
		return nil, err
	}
	return &tl, nil
}

func (r *MapRepository) UpdateTrafficLight(ctx context.Context, tl models.TrafficLight) error {
	_, err := r.db.Exec(ctx,
		`UPDATE traffic_lights SET address=$1, type=$2, year_installation=$3 WHERE id=$4`,
		tl.Address, tl.Type, tl.YearInstallation, tl.ID)
	if err != nil {
		r.logger.Error("UpdateTrafficLight failed", zap.Error(err))
	}
	return err
}

func (r *MapRepository) DeleteTrafficLight(ctx context.Context, id int64) error {
	_, err := r.db.Exec(ctx, `DELETE FROM traffic_lights WHERE id=$1`, id)
	if err != nil {
		r.logger.Error("DeleteTrafficLight failed", zap.Error(err))
	}
	return err
}

func (r *MapRepository) ListTrafficLights(ctx context.Context) ([]models.TrafficLight, error) {
	rows, err := r.db.Query(ctx, `SELECT id, address, type, year_installation FROM traffic_lights`)
	if err != nil {
		r.logger.Error("ListTrafficLights failed", zap.Error(err))
		return nil, err
	}
	defer rows.Close()

	var tls []models.TrafficLight
	for rows.Next() {
		var tl models.TrafficLight
		if err := rows.Scan(&tl.ID, &tl.Address, &tl.Type, &tl.YearInstallation); err != nil {
			r.logger.Error("ListTrafficLights scan failed", zap.Error(err))
			return nil, err
		}
		tls = append(tls, tl)
	}
	return tls, nil
}
