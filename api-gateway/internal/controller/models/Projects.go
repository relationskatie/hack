package models

import "github.com/google/uuid"

type Project struct {
	ID          uuid.UUID
	Title       string
	Description string
	UploadedBy  uuid.UUID
	CreatedAt   string
	UpdatedAt   string
	Filename    string
	File        []byte
	FileURL     string
}

type ProjectResponse struct {
	ID          uuid.UUID `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	UploadedBy  uuid.UUID `json:"uploaded_by"`
	CreatedAt   string    `json:"created_at"`
	UpdatedAt   string    `json:"updated_at"`
	Filename    string    `json:"filename"`
	File        string    `json:"file"`
	FileURL     string    `json:"file_url"`
}

type CreateProjectRequestHTTP struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Filename    string `json:"filename"`
	File        string `json:"file"`
}

type CreateProjectRequest struct {
	Title       string    `json:"title"`
	Description string    `json:"description"`
	UploadedBy  uuid.UUID `json:"uploaded_by"`
	Filename    string    `json:"filename"`
	File        []byte    `json:"file"`
}

type UpdateProjectRequestHTTP struct {
	Title       string `json:"title"`
	Description string `json:"description"`
}

type UpdateProjectRequest struct {
	ID          uuid.UUID
	Title       string
	Description string
	UploadedBy  uuid.UUID
}
