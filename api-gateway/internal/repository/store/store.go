package store

import (
	"sync"

	"github.com/google/uuid"
	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/api-gateway/config"
	"go.uber.org/zap"
)

type User struct {
	id       uuid.UUID
	password string
	role     string
}

type Store struct {
	log   *zap.Logger
	cfg   *config.Config
	users map[string]User
	mu    sync.Mutex
}

func New(log *zap.Logger, cfg *config.Config) (*Store, error) {
	users := readUsers()
	return &Store{
		log:   log,
		cfg:   cfg,
		users: users,
		mu:    sync.Mutex{},
	}, nil
}

func readUsers() map[string]User {
	m := make(map[string]User)
	m["test_user"] = User{
		id:       uuid.New(),
		password: "user_test_1",
		role:     "user",
	}

	m["editor"] = User{
		id:       uuid.New(),
		password: "editor_test_1",
		role:     "editor",
	}

	m["admin"] = User{
		id:       uuid.New(),
		password: "admin_test_1",
		role:     "admin",
	}
	return m

}
