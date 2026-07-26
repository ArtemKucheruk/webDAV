package redis

import (
	"github.com/ArtemKucheruk/webDAV.git/utils"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
)

type Redis struct {
	Client redis.Client;
	Logger *zerolog.Logger
}

func NewRedis(env *utils.Env, logger *zerolog.Logger) (*redis.Client, error){
	redisAddress:= env.Get("REDIS_ADDRESS")

	opt, err := redis.ParseURL(redisAddress)
	if err != nil {
		logger.Error().Err(err).Msg("failed to connect to redis")
		panic(err)
	}

	client := redis.NewClient(opt)
	logger.Info().Msg("redis has been initialized")
	return client, err
}

