package main

import (
	"context"

	"github.com/labstack/echo/v5"

	"github.com/ArtemKucheruk/webDAV.git/db"
	"github.com/ArtemKucheruk/webDAV.git/redis"
	"github.com/ArtemKucheruk/webDAV.git/routes"
	"github.com/ArtemKucheruk/webDAV.git/utils"
)

func main() {

	env := utils.NewEnv(&utils.AppLogger, ".env")

	if err := db.Connect(context.Background(), env, &utils.DBLogger); err != nil {
		utils.AppLogger.Err(err).Msg("failed to connect to db")
		panic(err)
	}
	defer db.Pool.Close()

	redisClient := redis.NewRedis(env, &utils.RedisLogger)

	_ = &redis.Redis{
		Client: *redisClient,
		Logger: &utils.RedisLogger,
	}

	e := echo.New()

	api := e.Group("/api")
	routes.SetupRoutes(api)

	err := e.Start(":8080")
	if err != nil {
		utils.AppLogger.Fatal().Err(err).Msg("failed to start backend")
	}

}
