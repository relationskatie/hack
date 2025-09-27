package models

import "time"

type CreateServiceRequest struct {
	Tittle       string     `json:"tittle"`
	Price        float64    `json:"price"`
	Description  string     `json:"description"`
	NeedSchedule bool       `json:"need_schedule"`
	Schedule     []TimeSlot `json:"schedule,omitempty"`
}

type TimeSlot struct {
	StartTime string `json:"start_time"`
	EndTime   string `json:"end_time"`
	IsBooked  bool   `json:"is_booked"`
	Date      string `json:"date"`
}

type CreateServiceResponse struct {
	Service ServiceInfo `json:"service"`
}

type ServiceInfo struct {
	ID           string     `json:"id"`
	Tittle       string     `json:"tittle"`
	Price        float64    `json:"price"`
	Description  string     `json:"description"`
	NeedSchedule bool       `json:"need_schedule"`
	Schedule     []TimeSlot `json:"schedule"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

type UpdateServiceRequest struct {
	Tittle      string  `json:"tittle"`
	Price       float64 `json:"price"`
	Description string  `json:"description"`
}

type UpdateServiceDTO struct {
	ServiceID   string
	Tittle      string
	Price       float64
	Description string
}

type UpdateServiceResponse struct {
	Message   string    `json:"message"`
	UpdatedAt time.Time `json:"updated_at"`
}

type DeleteServicesResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

type GetServicesByIDResponse struct {
	ServiceI `json:"service_info"`
}

type ServiceI struct {
	ID           string     `json:"id"`
	Tittle       string     `json:"tittle"`
	Price        float64    `json:"price"`
	Description  string     `json:"description"`
	NeedSchedule bool       `json:"need_schedule"`
	Schedule     []TimeSlot `json:"schedule"`
}
type ListServicesRequest struct {
	Limit  int32 `json:"limit"`
	Offset int32 `json:"offset"`
}

type ShortServiceInfo struct {
	ID           string  `json:"id"`
	Tittle       string  `json:"tittle"`
	Price        float64 `json:"price"`
	Description  string  `json:"description"`
	NeedSchedule bool    `json:"need_schedule"`
}

type ListServicesResponse struct {
	Services   []ShortServiceInfo `json:"services"`
	TotalCount int32              `json:"total_count"`
	Limit      int32              `json:"limit"`
	Offset     int32              `json:"offset"`
}
