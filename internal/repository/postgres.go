package repository

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresRepo struct {
    pool *pgxpool.Pool
}

func NewPostgresRepo(ctx context.Context, dsn string) (*PostgresRepo, error) {
    config, err := pgxpool.ParseConfig(dsn)
    if err != nil {
        return nil, err
    }

	// Defaults
    config.MaxConns = 10
    config.MinConns = 2
    config.MaxConnLifetime = 30 * time.Minute

    pool, err := pgxpool.NewWithConfig(ctx, config)
    if err != nil {
        return nil, err
    }

    // Test connection
    if err := pool.Ping(ctx); err != nil {
        return nil, err
    }

    return &PostgresRepo{pool: pool}, nil
}

// Initialize schema
func (r *PostgresRepo) Init(ctx context.Context) error {
    schema := ``
    _, err := r.pool.Exec(ctx, schema)
    return err
}

func (r *PostgresRepo) Close() {
    r.pool.Close()
}