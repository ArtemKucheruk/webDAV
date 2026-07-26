package main

import (
	"context"

	"github.com/labstack/echo/v5"

	"github.com/ArtemKucheruk/webDAV.git/db"
	"github.com/ArtemKucheruk/webDAV.git/routes"
	"github.com/ArtemKucheruk/webDAV.git/redis"
	"github.com/ArtemKucheruk/webDAV.git/utils"
)

func main() {

	env := utils.NewEnv(&utils.AppLogger)

	if err := db.Connect(context.Background(), env, &utils.DBLogger); err != nil {
		utils.AppLogger.Err(err).Msg("failed to connect to db")
	}
	defer db.Pool.Close()


	redisClient, err := redis.NewRedis(env, &utils.RedisLogger)
	if err != nil {
		utils.AppLogger.Err(err).Msg("failed to start redis")
	}


	  _ = &redis.Redis {
		 Client: *redisClient,
		 Logger: &utils.RedisLogger,
	}

	e := echo.New()

	api := e.Group("/api")
	routes.SetupRoutes(api)

	e.Start(":8080")
}
