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
	cfg, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return nil, err
	}

	cfg.MaxConns = 10
	cfg.MinConns = 2
	cfg.MaxConnLifetime = 30 * time.Minute

	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		return nil, err
	}

	if err := pool.Ping(ctx); err != nil {
		return nil, err
	}

	return &PostgresRepo{pool: pool}, nil
}

// Init runs the database schema migrations
func (r *PostgresRepo) Init(ctx context.Context) error {
	schema := `
	CREATE TABLE IF NOT EXISTS users (
		id            SERIAL PRIMARY KEY,
		username      VARCHAR(100) UNIQUE NOT NULL,
		password_hash TEXT NOT NULL,
		role          VARCHAR(50)  NOT NULL DEFAULT 'viewer',
		created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS contributions (
		id                SERIAL PRIMARY KEY,
		contributor_name  VARCHAR(255) NOT NULL,
		amount            DECIMAL(12,2) NOT NULL,
		contribution_date DATE NOT NULL,
		month             VARCHAR(7)   NOT NULL,  -- e.g. '2025-01'
		payment_method    VARCHAR(100),
		notes             TEXT,
		created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS expenses (
		id           SERIAL PRIMARY KEY,
		title        VARCHAR(255) NOT NULL,
		amount       DECIMAL(12,2) NOT NULL,
		category     VARCHAR(100) NOT NULL,
		expense_date DATE NOT NULL,
		notes        TEXT,
		created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
	);

	CREATE INDEX IF NOT EXISTS idx_contributions_month ON contributions(month);
	CREATE INDEX IF NOT EXISTS idx_expenses_category   ON expenses(category);
	CREATE INDEX IF NOT EXISTS idx_expenses_date       ON expenses(expense_date);
	`

	_, err := r.pool.Exec(ctx, schema)
	return err
}

func (r *PostgresRepo) Close() {
	r.pool.Close()
}