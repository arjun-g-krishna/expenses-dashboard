-- Idempotent schema for Postgres init
-- This will run only when the DB initializes (volume empty)

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          VARCHAR(50)  NOT NULL DEFAULT 'admin',
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contributions (
  id                SERIAL PRIMARY KEY,
  contributor_name  VARCHAR(255) NOT NULL,
  amount            DECIMAL(12,2) NOT NULL,
  contribution_date DATE NOT NULL,
  month             VARCHAR(7)   NOT NULL,
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
