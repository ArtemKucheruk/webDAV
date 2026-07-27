package cache

import (
	"net/http"
	"time"

	"github.com/ArtemKucheruk/webDAV.git/utils"
	"github.com/labstack/echo/v5"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
)

func CreateSession(c *echo.Context, rdb *redis.Client, userID int32, logger *zerolog.Logger) error {
	sessionID, err := utils.GenerateSessionId()
	if err != nil {
		logger.Err(err).Msg("failed to generate sessionID")
		return err
	}
	ctx := c.Request().Context()
	if err = rdb.Set(ctx, "session:"+sessionID, userID, 24*time.Hour).Err(); err != nil {
		logger.Err(err).Msg("failed to store user session")
		return err
	}
	c.SetCookie(&http.Cookie{
		Name:     "session_id",
		Value:    sessionID,
		Path:     "/",
		MaxAge:   int((24 * time.Hour).Seconds()),
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	})

	logger.Info().Int32("id", userID).Msg("session for user id was created")

	return nil
}
