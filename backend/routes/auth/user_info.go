package auth

import (
	"net/http"

	"github.com/ArtemKucheruk/webDAV.git/cache"
	"github.com/labstack/echo/v5"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
)

// GetUserInfo godoc
// @Summary      Get current session info
// @Tags         auth
// @Produce      json
// @Success      200  {object}  map[string]any
// @Failure      500  {object}  map[string]string
// @Router       /user/me [get]
func GetUserInfo(c *echo.Context, logger *zerolog.Logger, redis *redis.Client) error {
	ctx := c.Request().Context()
	sessionID, err := cache.GetUserSession(c, ctx, redis, logger)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to find sessionID")
	}
	return c.JSON(http.StatusOK, map[string]any{"session_id": sessionID})
}
