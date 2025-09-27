package pgx

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/order-service/internal/repository/models"
	"go.uber.org/zap"
)

const (
	insertServiceQuery = `
		INSERT INTO services (id, tittle, price, description, need_scheduler, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	insertTimeSlotQuery = `
		INSERT INTO service_schedule (id, service_id, order_id, user_id, schedule_date, start_time, end_time, is_booked, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`

	selectServiceByIDQuery = `
		SELECT id, tittle, price, description, need_scheduler, created_at, updated_at
		FROM services
		WHERE id = $1
	`

	selectTimeSlotsByServiceIDQuery = `
		SELECT id, service_id, order_id, user_id, schedule_date, start_time, end_time, is_booked, created_at, updated_at
		FROM service_schedule
		WHERE service_id = $1
		ORDER BY schedule_date, start_time
	`

	updateServiceQuery = `
		UPDATE services
		SET tittle = $2, price = $3, description = $4, updated_at = $5
		WHERE id = $1
	`

	selectServicesQueryWithPagination = `
		SELECT id, tittle, price, description, need_scheduler
		FROM services
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`

	countServicesQuery = `
		SELECT COUNT(*) FROM services
	`

	deleteServiceQuery = `
	DELETE FROM services
	WHERE id = $1
	`

	insertOrderQuery = `
		INSERT INTO orders (id, customer_id, service_id, description, location, scheduled_start_time, scheduled_end_time, schedule_date, status, created_at, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
	`

	selectAvailableSlotQuery = `
		SELECT id
		FROM service_schedule
		WHERE service_id = $1
		  AND schedule_date = $2
		  AND start_time = $3
		  AND end_time = $4
		  AND is_booked = FALSE
		LIMIT 1
	`

	bookSlotQuery = `
		UPDATE service_schedule
		SET is_booked = TRUE, order_id = $1, updated_at = $2
		WHERE id = $3
	`

	selectOrderByIDQuery = `
		SELECT id, customer_id, service_id, description, location,
		       scheduled_start_time, scheduled_end_time, status, created_at, updated_at
		FROM orders
		WHERE id = $1 AND customer_id = $2
	`

	selectOrderByIDQueryForAdmin = `
	SELECT id, customer_id, service_id, description, location, scheduled_start_time, scheduled_end_time, status, created_at, updated_at
	FROM orders
	WHERE id = $1
	`

	cancelOrder = `
        UPDATE orders
        SET status = 4, updated_at = $1
        WHERE id = $2 AND customer_id = $3 
    `

	changeOrderStatus = `
        UPDATE orders
        SET status = $1, updated_at = $2
        WHERE id = $3
    `
)

func (r *OrderRepository) CreateService(ctx context.Context, s models.Service) error {
	r.logger.Info("creating service", zap.String("service_id", s.ID.String()), zap.Int("schedule_count", len(s.Schedule)))

	if s.ID == uuid.Nil {
		s.ID = uuid.New()
		r.logger.Debug("generated new service ID", zap.String("service_id", s.ID.String()))
	}

	now := time.Now()
	s.CreatedAt = now
	s.UpdatedAt = now

	tx, err := r.db.Begin(ctx)
	if err != nil {
		r.logger.Error("failed to begin transaction", zap.Error(err))
		return err
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx,
		insertServiceQuery,
		s.ID, s.Tittle, s.Price, s.Description, s.NeedSchedule, s.CreatedAt, s.UpdatedAt,
	)
	if err != nil {
		r.logger.Error("failed to insert service", zap.String("service_id", s.ID.String()), zap.Error(err))
		return err
	}
	r.logger.Info("service inserted", zap.String("service_id", s.ID.String()))

	if s.NeedSchedule {
		for i := range s.Schedule {
			slot := &s.Schedule[i]
			if slot.ID == uuid.Nil {
				slot.ID = uuid.New()
				r.logger.Debug("generated new timeslot ID", zap.String("slot_id", slot.ID.String()))
			}
			slot.ServiceID = s.ID
			slot.CreatedAt = now
			slot.UpdatedAt = now

			_, err = tx.Exec(ctx,
				insertTimeSlotQuery,
				slot.ID, slot.ServiceID, slot.OrderID, slot.UserID,
				slot.Date, slot.StartTime, slot.EndTime, slot.IsBooked,
				slot.CreatedAt, slot.UpdatedAt,
			)
			if err != nil {
				r.logger.Error("failed to insert timeslot", zap.String("slot_id", slot.ID.String()), zap.Error(err))
				return err
			}
			r.logger.Info("timeslot inserted", zap.String("slot_id", slot.ID.String()), zap.String("service_id", s.ID.String()))
		}
	}

	if err := tx.Commit(ctx); err != nil {
		r.logger.Error("failed to commit transaction", zap.Error(err))
		return err
	}

	r.logger.Info("service created successfully", zap.String("service_id", s.ID.String()))
	return nil
}

func (r *OrderRepository) UpdateService(ctx context.Context, s models.Service) error {
	r.logger.Info("updating service", zap.String("service_id", s.ID.String()))

	now := time.Now()

	_, err := r.db.Exec(ctx,
		updateServiceQuery,
		s.ID, s.Tittle, s.Price, s.Description, now,
	)
	if err != nil {
		r.logger.Error("failed to update service", zap.String("service_id", s.ID.String()), zap.Error(err))
		return err
	}

	r.logger.Info("service updated successfully", zap.String("service_id", s.ID.String()))
	return nil
}

func (r *OrderRepository) GetServiceByID(ctx context.Context, serviceID uuid.UUID) (*models.Service, error) {
	r.logger.Info("fetching service by ID", zap.String("service_id", serviceID.String()))

	var service models.Service
	row := r.db.QueryRow(ctx, selectServiceByIDQuery, serviceID)
	err := row.Scan(
		&service.ID,
		&service.Tittle,
		&service.Price,
		&service.Description,
		&service.NeedSchedule,
		&service.CreatedAt,
		&service.UpdatedAt,
	)
	if err != nil {
		r.logger.Error("failed to fetch service", zap.String("service_id", serviceID.String()), zap.Error(err))
		return nil, err
	}

	rows, err := r.db.Query(ctx, selectTimeSlotsByServiceIDQuery, serviceID)
	if err != nil {
		r.logger.Error("failed to fetch service schedule", zap.String("service_id", serviceID.String()), zap.Error(err))
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var slot models.TimeSlot
		var orderID uuid.NullUUID
		err := rows.Scan(
			&slot.ID,
			&slot.ServiceID,
			&orderID,
			&slot.UserID,
			&slot.Date,
			&slot.StartTime,
			&slot.EndTime,
			&slot.IsBooked,
			&slot.CreatedAt,
			&slot.UpdatedAt,
		)
		if err != nil {
			r.logger.Error("failed to scan timeslot", zap.Error(err))
			return nil, err
		}

		if orderID.Valid {
			slot.OrderID = &orderID.UUID
		}

		service.Schedule = append(service.Schedule, slot)
	}

	r.logger.Info("service fetched successfully", zap.String("service_id", serviceID.String()), zap.Int("schedule_count", len(service.Schedule)))
	return &service, nil
}

func (r *OrderRepository) ListServices(ctx context.Context, limit, offset int) ([]models.Service, int, error) {
	r.logger.Info("listing services with pagination", zap.Int("limit", limit), zap.Int("offset", offset))

	rows, err := r.db.Query(ctx, selectServicesQueryWithPagination, limit, offset)
	if err != nil {
		r.logger.Error("failed to query services", zap.Error(err))
		return nil, 0, err
	}
	defer rows.Close()

	var services []models.Service
	for rows.Next() {
		var s models.Service
		err := rows.Scan(&s.ID, &s.Tittle, &s.Price, &s.Description, &s.NeedSchedule)
		if err != nil {
			r.logger.Error("failed to scan service", zap.Error(err))
			return nil, 0, err
		}
		services = append(services, s)
	}

	var total int
	err = r.db.QueryRow(ctx, countServicesQuery).Scan(&total)
	if err != nil {
		r.logger.Error("failed to count services", zap.Error(err))
		return nil, 0, err
	}

	return services, total, nil
}

func (r *OrderRepository) DeleteService(ctx context.Context, serviceID uuid.UUID) error {
	r.logger.Info("deleting service", zap.String("service_id", serviceID.String()))

	cmdTag, err := r.db.Exec(ctx, deleteServiceQuery, serviceID)
	if err != nil {
		r.logger.Error("failed to delete service", zap.String("service_id", serviceID.String()), zap.Error(err))
		return err
	}

	if cmdTag.RowsAffected() == 0 {
		r.logger.Warn("service not found", zap.String("service_id", serviceID.String()))
		return fmt.Errorf("service with ID %s not found", serviceID)
	}

	r.logger.Info("service deleted successfully", zap.String("service_id", serviceID.String()))
	return nil
}

func (r *OrderRepository) CreateOrder(ctx context.Context, order models.Order, needSchedule bool) error {
	r.logger.Info("creating order",
		zap.String("service_id", order.ServiceID.String()),
		zap.String("customer_id", order.CustomerID.String()),
	)

	tx, err := r.db.Begin(ctx)
	if err != nil {
		r.logger.Error("failed to begin transaction", zap.Error(err))
		return err
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx, insertOrderQuery,
		order.ID,
		order.CustomerID,
		order.ServiceID,
		order.Description,
		order.Location,
		order.ScheduledStartTime,
		order.ScheduledEndTime,
		order.Date,
		order.Status,
		order.CreatedAt,
		order.UpdatedAt,
	)
	if err != nil {
		r.logger.Error("failed to create order", zap.Error(err))
		return err
	}

	if needSchedule {
		var slotID uuid.UUID
		err := tx.QueryRow(ctx,
			selectAvailableSlotQuery,
			order.ServiceID,
			order.Date,
			order.ScheduledStartTime,
			order.ScheduledEndTime,
		).Scan(&slotID)
		if err != nil {
			r.logger.Error("slot unavailable or does not exist", zap.Error(err))
			return fmt.Errorf("requested time slot is unavailable")
		}

		_, err = tx.Exec(ctx, bookSlotQuery, order.ID, time.Now(), slotID)
		if err != nil {
			r.logger.Error("failed to book slot", zap.Error(err))
			return err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		r.logger.Error("failed to commit transaction", zap.Error(err))
		return err
	}

	r.logger.Info("order created successfully", zap.String("order_id", order.ID.String()))
	return nil
}

func (r *OrderRepository) GetOrder(ctx context.Context, orderID uuid.UUID, userID uuid.UUID) (*models.Order, error) {
	r.logger.Info("fetching order by ID", zap.String("order_id", orderID.String()))

	var order models.Order
	row := r.db.QueryRow(ctx, selectOrderByIDQuery, orderID, userID)

	err := row.Scan(
		&order.ID,
		&order.CustomerID,
		&order.ServiceID,
		&order.Description,
		&order.Location,
		&order.ScheduledStartTime,
		&order.ScheduledEndTime,
		&order.Status,
		&order.CreatedAt,
		&order.UpdatedAt,
	)
	if err != nil {
		r.logger.Error("failed to fetch order", zap.String("order_id", orderID.String()), zap.Error(err))
		return nil, err
	}

	r.logger.Info("order fetched successfully", zap.String("order_id", orderID.String()))
	return &order, nil
}

func (r *OrderRepository) GetOrderByID(ctx context.Context, orderID uuid.UUID) (*models.Order, error) {
	var order models.Order
	err := r.db.QueryRow(ctx, selectOrderByIDQueryForAdmin, orderID).Scan(
		&order.ID,
		&order.CustomerID,
		&order.ServiceID,
		&order.Description,
		&order.Location,
		&order.ScheduledStartTime,
		&order.ScheduledEndTime,
		&order.Status,
		&order.CreatedAt,
		&order.UpdatedAt,
	)
	if err != nil {
		r.logger.Error("failed to fetch order", zap.String("order_id", orderID.String()), zap.Error(err))
		return nil, err
	}
	return &order, nil
}

func (r *OrderRepository) CancelOrder(ctx context.Context, orderID, userID uuid.UUID) error {
	r.logger.Info("cancelling order", zap.String("order_id", orderID.String()), zap.String("user_id", userID.String()))

	result, err := r.db.Exec(ctx,
		cancelOrder,
		time.Now(), orderID, userID)
	if err != nil {
		r.logger.Error("failed to cancel order", zap.Error(err))
		return err
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("order cannot be cancelled or does not exist")
	}

	r.logger.Info("order cancelled successfully", zap.String("order_id", orderID.String()))
	return nil
}

func (r *OrderRepository) UpdateOrderStatus(ctx context.Context, orderID uuid.UUID, status int) error {
	r.logger.Info("updating order status", zap.String("order_id", orderID.String()), zap.Int("status", status))

	result, err := r.db.Exec(ctx, changeOrderStatus, status, time.Now(), orderID)
	if err != nil {
		r.logger.Error("failed to update order status", zap.Error(err))
		return err
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("order not found or status unchanged")
	}

	r.logger.Info("order status updated successfully", zap.String("order_id", orderID.String()))
	return nil
}

func (r *OrderRepository) ListOrders(ctx context.Context, limit, offset int32) ([]*models.Order, int32, error) {
	r.logger.Info("fetching orders", zap.Int32("limit", limit), zap.Int32("offset", offset))

	rows, err := r.db.Query(ctx, `
		SELECT id, customer_id, service_id, description, location,
		       scheduled_start_time, scheduled_end_time, status, created_at, updated_at
		FROM orders
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`, limit, offset)
	if err != nil {
		r.logger.Error("failed to query orders", zap.Error(err))
		return nil, 0, err
	}
	defer rows.Close()

	orders := []*models.Order{}
	for rows.Next() {
		var o models.Order
		if err := rows.Scan(
			&o.ID,
			&o.CustomerID,
			&o.ServiceID,
			&o.Description,
			&o.Location,
			&o.ScheduledStartTime,
			&o.ScheduledEndTime,
			&o.Status,
			&o.CreatedAt,
			&o.UpdatedAt,
		); err != nil {
			r.logger.Error("failed to scan order", zap.Error(err))
			return nil, 0, err
		}
		orders = append(orders, &o)
	}

	var totalCount int32
	err = r.db.QueryRow(ctx, `SELECT COUNT(*) FROM orders`).Scan(&totalCount)
	if err != nil {
		r.logger.Error("failed to count orders", zap.Error(err))
		return nil, 0, err
	}

	r.logger.Info("orders fetched successfully", zap.Int("count", len(orders)), zap.Int32("total_count", totalCount))
	return orders, totalCount, nil
}

func (r *OrderRepository) ListMyOrders(ctx context.Context, customerID uuid.UUID, limit, offset int32) ([]*models.Order, int32, error) {
	var orders []*models.Order
	var totalCount int32

	err := r.db.QueryRow(ctx, `
        SELECT COUNT(*) FROM orders WHERE customer_id = $1
    `, customerID).Scan(&totalCount)
	if err != nil {
		r.logger.Error("failed to count orders", zap.String("customer_id", customerID.String()), zap.Error(err))
		return nil, 0, err
	}

	rows, err := r.db.Query(ctx, `
        SELECT id, customer_id, service_id, description, location, scheduled_start_time, scheduled_end_time, status, created_at, updated_at
        FROM orders
        WHERE customer_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
    `, customerID, limit, offset)
	if err != nil {
		r.logger.Error("failed to fetch orders", zap.String("customer_id", customerID.String()), zap.Error(err))
		return nil, 0, err
	}
	defer rows.Close()

	for rows.Next() {
		var o models.Order
		if err := rows.Scan(
			&o.ID,
			&o.CustomerID,
			&o.ServiceID,
			&o.Description,
			&o.Location,
			&o.ScheduledStartTime,
			&o.ScheduledEndTime,
			&o.Status,
			&o.CreatedAt,
			&o.UpdatedAt,
		); err != nil {
			r.logger.Error("failed to scan order", zap.Error(err))
			return nil, 0, err
		}
		orders = append(orders, &o)
	}

	return orders, totalCount, nil
}
