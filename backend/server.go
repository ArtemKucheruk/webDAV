package main

import (
	"context"

	"github.com/labstack/echo/v5"

	"github.com/ArtemKucheruk/webDAV.git/cache"
	"github.com/ArtemKucheruk/webDAV.git/db"
	"github.com/ArtemKucheruk/webDAV.git/routes"
	"github.com/ArtemKucheruk/webDAV.git/storage"
	"github.com/ArtemKucheruk/webDAV.git/utils"
)

func main() {
	env := utils.NewEnv(&utils.AppLogger, ".env")

	if err := db.Connect(context.Background(), env, &utils.DBLogger); err != nil {
		utils.AppLogger.Err(err).Msg("failed to connect to db")
		panic(err)
	}
	defer db.Pool.Close()

	redisClient := cache.NewRedis(env, &utils.RedisLogger)

	redisStruct := &cache.Redis{
		Client: *redisClient,
		Logger: &utils.RedisLogger,
	}

	storageStruct := &storage.Storage{
		Logger: &utils.StorageLogger,
	}

	e := echo.New()

	api := e.Group("/api")
	routes.SetupRoutes(api, &utils.ApiLogger, &redisStruct.Client, storageStruct)

	err := e.Start(":8080")
	if err != nil {
		utils.AppLogger.Fatal().Err(err).Msg("failed to start backend")
	}
}
