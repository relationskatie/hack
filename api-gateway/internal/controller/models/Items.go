package models

type Item struct {
	ID     int64  `json:"id"`
	Title  string `json:"title"`
	Status string `json:"status"`
	Type   string `json:"type"`
}

type CreateItemRequest struct {
	Title  string `json:"title"`
	Status string `json:"status"`
	Type   string `json:"type"`
}

type UpdateItemRequest struct {
	Title  string `json:"title"`
	Status string `json:"status"`
	Type   string `json:"type"`
}
