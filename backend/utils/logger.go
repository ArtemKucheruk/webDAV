package utils

import (
	"os"
	"time"

	"github.com/rs/zerolog"
)



func InitLogger() zerolog.Logger {
	logger:= zerolog.New(zerolog.ConsoleWriter{Out: os.Stdout, TimeFormat: time.RFC3339})
	return logger
}

var Logger = InitLogger()
var AppLogger = Logger.With().Str("component", "DB").Logger()
var DBLogger = Logger.With().Str("component", "DB").Logger()
var ApiLogger = Logger.With().Str("component", "api").Logger()
var RedisLogger = Logger.With().Str("component", "redis").Logger()
