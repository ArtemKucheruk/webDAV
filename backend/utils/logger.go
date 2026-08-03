package utils

import (
	"os"
	"time"

	"github.com/rs/zerolog"
)

func InitLogger() zerolog.Logger {
	logger := zerolog.New(zerolog.ConsoleWriter{Out: os.Stdout, TimeFormat: time.RFC3339})
	return logger
}

var (
	Logger        = InitLogger()
	AppLogger     = Logger.With().Str("component", "DB").Logger()
	DBLogger      = Logger.With().Str("component", "DB").Logger()
	ApiLogger     = Logger.With().Str("component", "api").Logger()
	RedisLogger   = Logger.With().Str("component", "redis").Logger()
	StorageLogger = Logger.With().Str("component", "storage").Logger()
)
