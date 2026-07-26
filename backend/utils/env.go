package utils

import (
	"os"
	"strings"

	"github.com/joho/godotenv"
	"github.com/rs/zerolog"
)

type Env struct {
	logger *zerolog.Logger
}


func NewEnv(logger *zerolog.Logger, filenames ... string) *Env{
	if err := godotenv.Load(filenames...); err != nil && !os.IsNotExist(err){
		logger.Fatal().Err(err).Msg("error loading .env file")
	}
	return &Env{logger: logger}
}

func (e *Env) Get(key string) string {
	if path := os.Getenv(key + "_FILE"); path != "" {
		data, err := os.ReadFile(path) 

		if err != nil {
			e.logger.Fatal().Err(err).Msgf("Env: failed to read '%s_FILE' at '%s'", key, path)
		  panic(err)
		}

		value := strings.TrimSpace(string(data))
		if value == "" {
			e.logger.Fatal().Msgf("Env: '%s_FILE' at '%s' is empty", key, path)
		  panic(err)
		}
		return value 
	}

	value := os.Getenv(key)
	if value == "" {
		e.logger.Fatal().Msgf("Env: Variable '%s' not found", key)
	}

	e.logger.Debug().Msgf("Env: Retrieved variable '%s'", key)
	return value
}
