# Expense & Contribution Tracker

Backend API (Go) and dashboard frontend (React) for tracking group contributions, expenses, and remaining budget.

## Backend

Requires PostgreSQL. Copy environment variables (see `.env`) and run:

```bash
go run ./cmd/api
```

API listens on `:8080`. Registering a new account via the frontend or `POST /api/register` creates a user with the read-only `viewer` role by default. Additional admins can be created by manual database insertion or updates.

## Frontend

```bash
cd web
npm install
npm run dev
```
<img width="1608" height="1050" alt="image" src="https://github.com/user-attachments/assets/818ecf77-aa45-431a-89ff-fd139fd3fc97" />


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

### Production-style compose

```bash
docker compose up --build
```

### Development compose

Development compose with bind mounts and container-side dev servers:

```bash
docker compose -f docker-compose.dev.yml up --build
```

The API container uses Air for Go hot reload, so backend edits restart automatically.
