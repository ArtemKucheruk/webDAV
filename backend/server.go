package main

import (
	"github.com/labstack/echo/v5"

	"github.com/ArtemKucheruk/webDAV.git/routes"
)

func main() {
	e := echo.New()

	api := e.Group("/api")
	routes.SetupRoutes(api)

	e.Start(":8080")
}
