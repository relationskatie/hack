package models

import "github.com/google/uuid"

type Document struct {
	ID          uuid.UUID `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	UploadedBy  uuid.UUID `json:"uploaded_by"`
	CreatedAt   string    `json:"created_at"`
	File        []byte    `json:"file"`
	Filename    string    `json:"filename"`
}

type CreateDocumentRequestHTTP struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	File        string `json:"file"`
	Filename    string `json:"filename"`
}

type CreateDocumentRequest struct {
	Title       string
	Description string
	UploadedBy  uuid.UUID
	File        []byte
	Filename    string
}

type CreateDocumentResponse struct {
	ID          uuid.UUID `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	UploadedBy  uuid.UUID `json:"uploaded_by"`
	CreatedAt   string    `json:"created_at"`
	Filename    string    `json:"filename"`
	FileURL     string    `json:"file_url"`
}

type GetDocumentRequest struct {
	ID uuid.UUID `json:"id"`
}

type GetDocumentResponse struct {
	Document Document `json:"document"`
}

type ListDocumentsRequest struct {
	Limit  int32 `json:"limit"`
	Offset int32 `json:"offset"`
}

type ListDocumentsResponse struct {
	Items []Document `json:"items"`
}

type DeleteDocumentRequest struct {
	ID uuid.UUID `json:"id"`
}
