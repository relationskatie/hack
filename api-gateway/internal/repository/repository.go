package repository

import "github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/api-gateway/internal/repository/store"

type RepositoryInterface interface {
	GetUser(login string) (*store.UserData, error)
}
