-- Sample data for local development and manual testing.
-- Password for admin and viewer: demo1234
-- Run: ./tests/seed.sh   (or psql with your DSN)
-- Ensure schema exists (idempotent)
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

BEGIN;

-- Truncate target tables if they exist (safe, per-table checks)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename='contributions') THEN
    EXECUTE 'TRUNCATE TABLE contributions RESTART IDENTITY CASCADE';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename='expenses') THEN
    EXECUTE 'TRUNCATE TABLE expenses RESTART IDENTITY CASCADE';
  END IF;
END$$;

INSERT INTO users (username, password_hash, role) VALUES
  ('admin', '$2a$10$rpgANZ8pY46uR45kaO4wbuPyg1mntfXyRukXdB0d6Ovmc3PedUVX6', 'admin'),
  ('viewer', '$2a$10$rpgANZ8pY46uR45kaO4wbuPyg1mntfXyRukXdB0d6Ovmc3PedUVX6', 'viewer')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role;

INSERT INTO contributions (contributor_name, amount, contribution_date, month, payment_method, notes, created_at) VALUES
  ('Arjun Krishna', 3000, '2026-03-05', '2026-03', 'UPI', 'March club dues', '2026-03-05 18:30:00+00'),
  ('Priya Nair', 2500, '2026-03-08', '2026-03', 'Bank Transfer', '', '2026-03-08 09:15:00+00'),
  ('Rahul Mehta', 2000, '2026-03-12', '2026-03', 'Cash', 'Paid at meetup', '2026-03-12 14:00:00+00'),
  ('Arjun Krishna', 1500, '2026-04-02', '2026-04', 'UPI', 'Top-up', '2026-04-02 11:20:00+00'),
  ('Priya Nair', 3000, '2026-04-04', '2026-04', 'UPI', '', '2026-04-04 16:45:00+00'),
  ('Sneha Patel', 2500, '2026-04-10', '2026-04', 'Card', 'New member', '2026-04-10 08:00:00+00'),
  ('Rahul Mehta', 2500, '2026-04-15', '2026-04', 'Bank Transfer', '', '2026-04-15 19:30:00+00'),
  ('Arjun Krishna', 3500, '2026-05-01', '2026-05', 'UPI', 'May contribution', '2026-05-01 10:00:00+00'),
  ('Priya Nair', 3000, '2026-05-03', '2026-05', 'UPI', '', '2026-05-03 12:30:00+00'),
  ('Sneha Patel', 2500, '2026-05-06', '2026-05', 'Cash', '', '2026-05-06 17:00:00+00'),
  ('Rahul Mehta', 2000, '2026-05-08', '2026-05', 'UPI', 'Partial — balance next week', '2026-05-08 09:45:00+00');

INSERT INTO expenses (title, amount, category, expense_date, notes, created_at) VALUES
  ('Weekly groceries', 1850, 'Food', '2026-03-09', 'Shared kitchen stock', '2026-03-09 20:00:00+00'),
  ('Wi-Fi bill', 999, 'Utilities', '2026-03-15', 'March billing cycle', '2026-03-15 11:00:00+00'),
  ('Plumbing repair', 2200, 'Maintenance', '2026-03-22', 'Kitchen sink', '2026-03-22 15:30:00+00'),
  ('Team dinner', 4200, 'Food', '2026-04-06', '8 members', '2026-04-06 21:00:00+00'),
  ('Spring meetup venue', 3500, 'Event', '2026-04-12', 'Community hall deposit', '2026-04-12 13:00:00+00'),
  ('Electricity', 2800, 'Utilities', '2026-04-18', '', '2026-04-18 10:00:00+00'),
  ('Cleaning supplies', 650, 'Miscellaneous', '2026-04-25', '', '2026-04-25 16:20:00+00'),
  ('Breakfast catering', 2400, 'Food', '2026-05-04', 'Sunday session', '2026-05-04 08:30:00+00'),
  ('Projector rental', 1200, 'Event', '2026-05-07', 'Presentation night', '2026-05-07 14:00:00+00'),
  ('Water tank service', 900, 'Maintenance', '2026-05-10', 'Quarterly service', '2026-05-10 11:45:00+00');

COMMIT;
