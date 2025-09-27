package http

import (
	"fmt"

	"github.com/google/uuid"
	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/api-gateway/internal/pkg/token"
	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/api-gateway/internal/repository/store"
	"github.com/labstack/echo"
	"go.uber.org/zap"
)

const (
	userRole    = "user"
	editorRole  = "editor"
	adminRole   = "admin"
	unknownRole = "unknown"
)

func (ctrl *Controller) checkValidRegisterData(login string, password string) *store.UserData {
	user, err := ctrl.repo.GetUser(login)
	if err != nil {
		ctrl.log.Error("failed to get user from store", zap.Error(err), zap.String("login", login))
		return nil
	}

	if user == nil {
		ctrl.log.Warn("user not found", zap.String("login", login))
		return nil
	}

	if password != user.Password {
		ctrl.log.Warn("invalid password", zap.String("login", login))
		return nil
	}

	ctrl.log.Info("user authenticated successfully", zap.String("login", login))
	return user
}

func (ctrl *Controller) createToken(login string, password string) string {
	user := ctrl.checkValidRegisterData(login, password)
	if user == nil {
		ctrl.log.Warn("cannot create token, invalid credentials", zap.String("login", login))
		return ""
	}

	var role string
	switch user.Role {
	case "user":
		role = userRole
	case "editor":
		role = editorRole
	case "admin":
		role = adminRole
	default:
		ctrl.log.Warn("unknown role for user", zap.String("login", login), zap.String("role", user.Role))
		return ""
	}

	tokenStr, err := token.GenerateJWT(user.ID, role)
	if err != nil {
		ctrl.log.Error("failed to generate JWT", zap.String("login", login), zap.Error(err))
		return ""
	}

	ctrl.log.Info("token generated successfully", zap.String("login", login), zap.String("role", role))
	return tokenStr
}

func (ctrl *Controller) getUserDataFromToken(ctx echo.Context) (uuid.UUID, string, error) {
	tok, err := ctrl.getTokenFromHeader(ctx)
	if err != nil {
		ctrl.log.Warn("failed to get token from header", zap.Error(err))
		return uuid.Nil, unknownRole, err
	}

	if tok == "" {
		ctrl.log.Warn("empty token in header")
		return uuid.Nil, unknownRole, fmt.Errorf("empty token")
	}

	data, err := token.ParseJWT(tok)
	if err != nil {
		ctrl.log.Warn("failed to parse JWT", zap.Error(err))
		return uuid.Nil, unknownRole, err
	}

	if data.ID == uuid.Nil {
		ctrl.log.Warn("token contains nil ID")
		return uuid.Nil, unknownRole, fmt.Errorf("invalid token ID")
	}

	if data.Role == "" {
		ctrl.log.Warn("token contains empty role")
		return uuid.Nil, unknownRole, fmt.Errorf("invalid token role")
	}

	ctrl.log.Info("token parsed successfully", zap.String("role", data.Role), zap.String("id", data.ID.String()))
	return data.ID, data.Role, nil
}

func (ctrl *Controller) getTokenFromHeader(ctx echo.Context) (string, error) {
	authHeader := ctx.Request().Header.Get("Authorization")
	if authHeader == "" {
		ctrl.log.Warn("missing Authorization header")
		return "", fmt.Errorf("missing Authorization header")
	}

	const prefix = "Bearer "
	if len(authHeader) < len(prefix) || authHeader[:len(prefix)] != prefix {
		ctrl.log.Warn("invalid Authorization header format", zap.String("header", authHeader))
		return "", fmt.Errorf("invalid Authorization header format")
	}

	tokenStr := authHeader[len(prefix):]
	ctrl.log.Debug("token retrieved from header", zap.String("token", tokenStr))
	return tokenStr, nil
}

// Item types
const (
	ItemTypeTrafficLight = "traffic_light"
	ItemTypeAccident     = "accident"
	ItemTypeRepair       = "repair"
)

// Item statuses
const (
	ItemStatusActive   = "active"
	ItemStatusCanceled = "canceled"
)

var validTypes = map[string]bool{
	ItemTypeTrafficLight: true,
	ItemTypeAccident:     true,
	ItemTypeRepair:       true,
}

var validStatuses = map[string]bool{
	ItemStatusActive:   true,
	ItemStatusCanceled: true,
}
