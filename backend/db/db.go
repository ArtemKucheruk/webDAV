package db

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

var Pool *pgxpool.Pool

func Connect(ctx context.Context) error {
	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "postgres"
	}

	dsn := fmt.Sprintf("postgres://%s:%s@%s:5432/%s?sslmode=disable",
		os.Getenv("DB_USER"), os.Getenv("DB_PASSWORD"), host, os.Getenv("DB_NAME"))

	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		return err
	}
	if err := pool.Ping(ctx); err != nil {
		return err
	}

	Pool = pool
	return nil
}