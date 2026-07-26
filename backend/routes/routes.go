package routes

import (
	"github.com/labstack/echo/v5"
	"github.com/rs/zerolog"
)

func SetupRoutes(api *echo.Group, logger *zerolog.Logger) {
	Group(api, "/health", func(r *echo.Group) {
		r.GET("/ping", Ping)
	})

	Group(api, "/user", func(r *echo.Group) {
		r.POST("/create", func(c *echo.Context) error {
			return RegisterUser(c, logger)
		})
	})
}
