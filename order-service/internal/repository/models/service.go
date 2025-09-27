package models

import (
	"time"

	"github.com/google/uuid"
)

type Service struct {
	ID           uuid.UUID
	Tittle       string
	Price        float64
	Description  string
	CreatedAt    time.Time
	UpdatedAt    time.Time
	NeedSchedule bool
	Schedule     []TimeSlot
}

type TimeSlot struct {
	ID        uuid.UUID
	ServiceID uuid.UUID
	OrderID   *uuid.UUID
	UserID    uuid.UUID
	Date      time.Time
	StartTime string
	EndTime   string
	IsBooked  bool
	CreatedAt time.Time
	UpdatedAt time.Time
}
