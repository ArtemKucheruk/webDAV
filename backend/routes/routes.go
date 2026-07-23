package routes

import (
	"github.com/labstack/echo/v5"
)

func SetupRoutes(api *echo.Group){
	Group(api, "/health", func(r *echo.Group) {
		r.GET("/ping", Ping)
	})
}
