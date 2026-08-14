package routes

import (
	"net/http"

	"github.com/labstack/echo/v5"
)

// Ping godoc
// @Summary  Health check
// @Tags     health
// @Produce  plain
// @Success  200  {string}  string  "pong"
// @Router   /health/ping [get]
func Ping(c *echo.Context) error {
	return c.String(http.StatusOK, "pong")
}
