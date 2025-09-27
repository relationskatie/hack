package models

type CreateOrderRequest struct {
	ServiceID   string `json:"service_id"`
	Description string `json:"description"`
	Location    string `json:"location"`
	StartTime   string `json:"start_time"`
	EndTime     string `json:"end_time"`
	Date        string `json:"date"`
}

type CreateOrderDTO struct {
	CustomerID  string
	ServiceID   string
	Description string
	Location    string
	StartTime   string
	EndTime     string
	Date        string
}

type CreateOrderResponse struct {
	OrderID   string           `json:"order_id"`
	Service   ShortServiceInfo `json:"service"`
	Status    string           `json:"status"`
	CreatedAt string           `json:"created_at"`
}

type OrderForUserResponse struct {
	OrderID            string `json:"order_id"`
	CustomerID         string `json:"customer_id"`
	ServiceID          string `json:"service_id"`
	Description        string `json:"description"`
	Location           string `json:"location"`
	ScheduledStartTime string `json:"start_time"`
	ScheduledEndTime   string `json:"end_time"`
	Status             string `json:"status"`
	CreatedAt          string `json:"created_at"`
	UpdatedAt          string `json:"updated_at"`
}

type CancelOrderResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

type UpdateOrderStatusRequest struct {
	OrderID string `json:"order_id"`
	Status  string `json:"status"` // PENDING / CONFIRMED / DONE / CANCELED
}

type UpdateOrderStatusResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

type ListOrdersRequest struct {
	Limit  int `json:"limit"`
	Offset int `json:"offset"`
}

type ListOrdersResponse struct {
	Orders     []OrderForUserResponse `json:"orders"`
	TotalCount int                    `json:"total_count"`
	Limit      int                    `json:"limit"`
	Offset     int                    `json:"offset"`
}

type ListMyOrdersRequest struct {
	CustomerID string `json:"customer_id"`
	Limit      int    `json:"limit"`
	Offset     int    `json:"offset"`
}

type ListMyOrdersResponse struct {
	Orders     []OrderForUserResponse `json:"orders"`
	TotalCount int                    `json:"total_count"`
	Limit      int                    `json:"limit"`
	Offset     int                    `json:"offset"`
}
