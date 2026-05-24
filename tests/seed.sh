#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

: "${DB_HOST:=localhost}"
: "${DB_PORT:=5432}"
: "${DB_USER:=postgres}"
: "${DB_PASSWORD:=postgres}"
: "${DB_NAME:=expenses}"
: "${DB_SSLMODE:=disable}"

export PGPASSWORD="$DB_PASSWORD"

echo "Seeding database ${DB_NAME} on ${DB_HOST}:${DB_PORT}..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f tests/seed.sql
echo "Done. Login with admin/demo1234 or viewer/demo1234"
