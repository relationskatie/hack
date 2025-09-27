package http

import (
	"net/http"

	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/api-gateway/internal/controller/models"
	"github.com/labstack/echo"
	"go.uber.org/zap"
)

func (ctrl *Controller) handleLogin(ctx echo.Context) error {
	var req models.LoginRequest
	if err := ctx.Bind(&req); err != nil {
		ctrl.log.Error("failed to bind create news request", zap.Error(err))
		return ctx.JSON(http.StatusBadRequest, err.Error())
	}

	token := ctrl.createToken(req.Login, req.Password)

	if token == "" {
		return ctx.JSON(http.StatusBadRequest, "failed to create token")
	}

	resp := &models.LoginResponse{
		Token: token,
	}

	return ctx.JSON(http.StatusOK, resp)

}

func (ctrl *Controller) handleGetUserRole(ctx echo.Context) error {
	userID, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to get user data from token", zap.Error(err))
		return ctx.JSON(http.StatusUnauthorized, map[string]string{
			"user_id": "",
			"role":    unknownRole,
		})
	}

	return ctx.JSON(http.StatusOK, map[string]interface{}{
		"user_id": userID.String(),
		"role":    role,
	})
}
