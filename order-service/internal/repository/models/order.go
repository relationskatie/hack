package models

import (
	"time"

	"github.com/google/uuid"
)

type Order struct {
	ID                 uuid.UUID `db:"id"`
	CustomerID         uuid.UUID `db:"customer_id"`
	ServiceID          uuid.UUID `db:"service_id"`
	Description        string    `db:"description"`
	Location           string    `db:"location"`
	ScheduledStartTime time.Time `db:"scheduled_start_time"`
	ScheduledEndTime   time.Time `db:"scheduled_end_time"`
	Status             int       `db:"status"`
	CreatedAt          time.Time `db:"created_at"`
	UpdatedAt          time.Time `db:"updated_at"`
	Date               time.Time
}
