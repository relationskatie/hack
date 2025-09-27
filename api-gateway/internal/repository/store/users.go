package store

import (
	"fmt"

	"github.com/google/uuid"
)

type UserData struct {
	ID       uuid.UUID
	Login    string
	Password string
	Role     string
}

func (s *Store) GetUser(login string) (*UserData, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	user, ok := s.users[login]
	if !ok {
		return nil, fmt.Errorf("user %s not found", login)
	}

	return &UserData{
		ID:       user.id,
		Login:    login,
		Password: user.password,
		Role:     user.role,
	}, nil
}
