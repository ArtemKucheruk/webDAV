package routes

import (
	"github.com/ArtemKucheruk/webDAV.git/routes/auth"
	"github.com/ArtemKucheruk/webDAV.git/routes/files"
	"github.com/ArtemKucheruk/webDAV.git/storage"
	"github.com/labstack/echo/v5"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
)

func SetupRoutes(api *echo.Group, logger *zerolog.Logger, redis *redis.Client, storage *storage.Storage) {
	Group(api, "/health", func(r *echo.Group) {
		r.GET("/ping", Ping)
	})

	Group(api, "/user", func(r *echo.Group) {
		r.POST("/create", func(c *echo.Context) error {
			return auth.RegisterUser(c, logger, redis)
		})

		r.POST("/login", func(c *echo.Context) error {
			return auth.LoginUser(c, logger, redis)
		})

		r.POST("/logout", func(c *echo.Context) error {
			return auth.LogoutUser(c, logger, redis)
		})
	})

	Group(api, "/file", func(r *echo.Group) {
		r.GET("/get_all", func(c *echo.Context) error {
			return files.GetAllUserFiles(c, logger, redis)
		})

		r.POST("/delete", func(c *echo.Context) error {
			return files.DeleteFile(c, logger, redis, storage)
		})
	})
}
