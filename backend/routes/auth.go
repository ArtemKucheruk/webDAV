package routes

import (
	"errors"
	"net/http"
	"net/mail"

	"github.com/ArtemKucheruk/webDAV.git/cache"
	"github.com/ArtemKucheruk/webDAV.git/db"
	"github.com/ArtemKucheruk/webDAV.git/db/sqlc"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/labstack/echo/v5"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
	"golang.org/x/crypto/bcrypt"
)

type registerReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func RegisterUser(c *echo.Context, logger *zerolog.Logger, redis *redis.Client) error {
	var userData registerReq
	if err := c.Bind(&userData); err != nil {
		logger.Err(err).Msg("failed to bind user registry data")
		return echo.NewHTTPError(http.StatusBadRequest, "invalid body")
	}

	if _, err := mail.ParseAddress(userData.Email); err != nil {
		logger.Err(err).Str("email", userData.Email).Msg("invalid email on register")
		return echo.NewHTTPError(http.StatusBadRequest, "invalid email")
	}

	if len(userData.Password) < 8 {
		return echo.NewHTTPError(http.StatusBadRequest, "password should be min 8 characters")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(userData.Password), bcrypt.DefaultCost)
	if err != nil {
		logger.Err(err).Msg("failed to hash the password")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to hash the password")
	}

	queries := sqlc.New(db.Pool)
	id, err := queries.CreateUser(c.Request().Context(), sqlc.CreateUserParams{
		Email:        userData.Email,
		PasswordHash: string(hash),
	})
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return echo.NewHTTPError(http.StatusConflict, "email already registred")
		}
		logger.Err(err).Msg("failed to create user")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create user")
	}
	logger.Info().Str("user", userData.Email).Msg("user was successfully created")

	if err := cache.CreateSession(c, redis, id, logger); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create session")
	}

	return c.JSON(http.StatusCreated, map[string]any{"id": id})
}
