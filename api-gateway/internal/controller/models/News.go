package models

import (
	"github.com/google/uuid"
)

type CreateNewsRequest struct {
	Title      string
	Content    string
	UploadedBy uuid.UUID
	Filename   string
	File       []byte
}

type CreateNewsRequestHTTP struct {
	Title      string    `json:"title"`
	Content    string    `json:"content"`
	UploadedBy uuid.UUID `json:"uploaded_by"`
	Filename   string    `json:"filename"`
	File       string    `json:"file"`
}

type CreateNewsResponse struct {
	ID         uuid.UUID `json:"id"`
	Title      string    `json:"title"`
	Content    string    `json:"content"`
	UploadedBy uuid.UUID `json:"uploaded_by"`
	CreatedAt  string    `json:"created_at"`
	FileURL    string    `json:"file_url"`
}

type GetNewsRequest struct {
	ID uuid.UUID `json:"id"`
}

type GetNewsResponse struct {
	ID         uuid.UUID `json:"id"`
	Title      string    `json:"title"`
	Content    string    `json:"content"`
	UploadedBy uuid.UUID `json:"uploaded_by"`
	CreatedAt  string    `json:"created_at"`
	UpdatedAt  string    `json:"updated_at"`
	File       string    `json:"file"`
	Filename   string    `json:"filename"`
}

type UpdateNewsRequestHTTP struct {
	Title   string `json:"title"`
	Content string `json:"content"`
}

type UpdateNewsRequest struct {
	ID         uuid.UUID
	Title      string
	Content    string
	UploadedBy uuid.UUID
}

type UpdateNewsResponse struct {
	ID         uuid.UUID `json:"id"`
	Title      string    `json:"title"`
	Content    string    `json:"content"`
	UploadedBy uuid.UUID `json:"uploaded_by"`
	CreatedAt  string    `json:"created_at"`
	UpdatedAt  string    `json:"updated_at"`
}

type DeleteNewsRequest struct {
	ID uuid.UUID `json:"id"`
}

type DeleteNewsResponse struct {
	ID      uuid.UUID `json:"id"`
	Message string    `json:"message"`
}

type ListNewsRequest struct {
	Limit  int32 `json:"limit"`
	Offset int32 `json:"offset"`
}

type ListNewsResponse struct {
	Items []GetNewsResponse `json:"items"`
}

type GetCountNewsResponse struct {
	Count int64 `json:"count"`
}
