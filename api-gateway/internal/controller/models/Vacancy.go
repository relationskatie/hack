package models

import "github.com/google/uuid"

type CreateVacancyRequest struct {
	Position    string `json:"position"`
	Description string `json:"description"`
	Salary      string `json:"salary"`
	IsActive    bool   `json:"is_active"`
}

type CreateVacancyResponse struct {
	ID          uuid.UUID `json:"id"`
	Position    string    `json:"position"`
	Description string    `json:"description"`
	Salary      string    `json:"salary"`
	IsActive    bool      `json:"is_active"`
	PublishedAt string    `json:"published_at"`
}

type GetVacancyRequest struct {
	ID uuid.UUID `json:"id"`
}

type GetVacancyResponse struct {
	ID          uuid.UUID `json:"id"`
	Position    string    `json:"position"`
	Description string    `json:"description"`
	Salary      string    `json:"salary"`
	IsActive    bool      `json:"is_active"`
	PublishedAt string    `json:"published_at"`
}

type UpdateVacancyRequestHTTP struct {
	Position    string `json:"position"`
	Description string `json:"description"`
	Salary      string `json:"salary"`
	IsActive    bool   `json:"is_active"`
}

type UpdateVacancyRequest struct {
	ID          uuid.UUID
	Position    string
	Description string
	Salary      string
	IsActive    bool
}

type UpdateVacancyResponse struct {
	ID          uuid.UUID `json:"id"`
	Position    string    `json:"position"`
	Description string    `json:"description"`
	Salary      string    `json:"salary"`
	IsActive    bool      `json:"is_active"`
	PublishedAt string    `json:"published_at"`
}

type DeleteVacancyRequest struct {
	ID uuid.UUID `json:"id"`
}

type DeleteVacancyResponse struct {
	ID      uuid.UUID `json:"id"`
	Message string    `json:"message"`
}

type ListVacanciesRequest struct {
	Limit  int32 `json:"limit"`
	Offset int32 `json:"offset"`
}

type ListVacanciesResponse struct {
	Items []GetVacancyResponse `json:"items"`
}

type GetCountVacanciesResponse struct {
	Count int64 `json:"count"`
}
