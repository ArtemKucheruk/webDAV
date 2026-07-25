package main

import (
	"context"
	"log"

	"github.com/labstack/echo/v5"

	"github.com/ArtemKucheruk/webDAV.git/db"
	"github.com/ArtemKucheruk/webDAV.git/routes"
)

func main() {
	if err := db.Connect(context.Background()); err != nil {
		log.Fatalf("db connect: %v", err)
	}
	defer db.Pool.Close()

	e := echo.New()

	api := e.Group("/api")
	routes.SetupRoutes(api)

	e.Start(":8080")
}
