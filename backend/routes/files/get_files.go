package files

import (
	"errors"
	"net/http"

	"github.com/ArtemKucheruk/webDAV.git/cache"
	"github.com/ArtemKucheruk/webDAV.git/db"
	"github.com/ArtemKucheruk/webDAV.git/db/sqlc"
	"github.com/labstack/echo/v5"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
)

func GetAllUserFiles(c *echo.Context, logger *zerolog.Logger, redis *redis.Client) error {
	ctx := c.Request().Context()
	userID, err := cache.GetSession(c, ctx, redis, logger)
	if err != nil {
		if errors.Is(err, cache.ErrSessionNotFound) {
			return echo.NewHTTPError(http.StatusUnauthorized, "invalid session")
		}
		logger.Err(err).Msg("failed to find user session")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to get user session")
	}

	queries := sqlc.New(db.Pool)
	userFiles, err := queries.GetAllUserFiles(c.Request().Context(), userID)
	if err != nil {
		logger.Err(err).Int32("userID", userID).Msg("failed to get user files")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to get user files")
	}
	return c.JSON(http.StatusOK, map[string]any{"files": userFiles})
}
