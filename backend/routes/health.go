package routes

import (
	"net/http"

	"github.com/labstack/echo/v5"
)

func Ping(c *echo.Context)error{
	return c.String(http.StatusOK, "pong")
}
