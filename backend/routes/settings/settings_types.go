package settings

import (
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/rs/zerolog"
)

type changeUserPasswordRequest struct {
	NewPassword string `json:"password"`
	OldPassword string `json:"old_password"`
}

func (c changeUserPasswordRequest) ValidateUserPassword(logger *zerolog.Logger) error {
	if len(c.NewPassword) < 8 {
		return echo.NewHTTPError(http.StatusBadRequest, "password should be min 8 characters")
	}
	return nil
}
