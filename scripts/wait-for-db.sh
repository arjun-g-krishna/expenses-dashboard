#!/usr/bin/env sh
# Wait for Postgres to be available before starting the app
set -e

: ${DB_HOST:=db}
: ${DB_PORT:=5432}
: ${DB_USER:=postgres}
: ${DB_NAME:=expenses}

echo "Waiting for postgres at ${DB_HOST}:${DB_PORT}..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 2
done

>&2 echo "Postgres is up - executing command"
exec "$@"