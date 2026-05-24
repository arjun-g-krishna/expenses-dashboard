# Expense & Contribution Tracker

Backend API (Go) and dashboard frontend (React) for tracking group contributions, expenses, and remaining budget.

## Backend

Requires PostgreSQL. Copy environment variables (see `.env`) and run:

```bash
go run ./cmd/api
```

API listens on `:8080`. Register the first user via `POST /api/register` (created with `admin` role). Additional users can be given `viewer` role in the database for read-only access.

## Frontend

```bash
cd web
npm install
npm run dev
```

Open http://localhost:5173. The dev server proxies `/api` to the Go API on port 8080.

### Production build

```bash
cd web
npm run build
```

Set `VITE_API_URL` to your API origin if the frontend is served separately.

## Roles

| Role   | Access                                      |
| ------ | --------------------------------------------- |
| admin  | Full CRUD on contributions and expenses       |
| viewer | View dashboard, lists, charts, export reports |

Role is encoded in the JWT (`role` claim) after login.

## Sample data

See [tests/README.md](tests/README.md). Quick seed:

```bash
./tests/seed.sh
```

Login: `admin` / `demo1234` or `viewer` / `demo1234`.

## Start the containers
docker compose up --build

## Run in detached mode (background)
docker compose up --build -d