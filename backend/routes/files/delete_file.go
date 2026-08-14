package files

import (
	"net/http"

	"github.com/ArtemKucheruk/webDAV.git/cache"
	"github.com/ArtemKucheruk/webDAV.git/db"
	"github.com/ArtemKucheruk/webDAV.git/db/sqlc"
	"github.com/ArtemKucheruk/webDAV.git/storage"
	"github.com/labstack/echo/v5"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
)

type deleteFileRequest struct {
	FileID int32 `json:"file_id"`
}

func DeleteFile(c *echo.Context, logger *zerolog.Logger, redis *redis.Client, s *storage.Storage) error {
	var deleteFileRequest deleteFileRequest
	ctx := c.Request().Context()
	userID, err := cache.GetUserIDFromSession(c, ctx, redis, logger)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}
	if err := c.Bind(&deleteFileRequest); err != nil {
		logger.Err(err).Msg("Can't bind file_id")
		return echo.NewHTTPError(http.StatusBadRequest, "bad request")
	}

	queries := sqlc.New(db.Pool)

	filename, err := queries.GetFileName(ctx, sqlc.GetFileNameParams{
		ID:     deleteFileRequest.FileID,
		UserID: userID,
	})
	if err != nil {
		logger.Err(err).Int32("file_id", deleteFileRequest.FileID).Msg("failed to get filename name of fileID")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to get filename name of fileID")
	}

	if err := s.DeleteFile(int(userID), int(deleteFileRequest.FileID), filename); err != nil {
		logger.Err(err).Int32("file_id", deleteFileRequest.FileID).Msg("failed to delete file from disk")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to delete file")
	}

	if _, err := queries.DeleteFile(ctx, sqlc.DeleteFileParams{
		ID:     deleteFileRequest.FileID,
		UserID: userID,
	}); err != nil {
		logger.Err(err).Int32("file_id", deleteFileRequest.FileID).Msg("failed to delete file record")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to delete file")
	}
	return nil
}
