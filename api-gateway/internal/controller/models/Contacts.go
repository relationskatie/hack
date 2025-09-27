package models

import "github.com/google/uuid"

type Contact struct {
	ID        uuid.UUID `json:"id"`
	Title     string    `json:"title"`
	Phones    []string  `json:"phones"`
	Emails    []string  `json:"emails"`
	Addresses []string  `json:"addresses"`
}

type ContactCreate struct {
	Title     string   `json:"title"`
	Phones    []string `json:"phones"`
	Emails    []string `json:"emails"`
	Addresses []string `json:"addresses"`
}
