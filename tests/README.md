# Tests & sample data

Fixtures and seed scripts for local development, API exploration, and future automated tests.

## Fixtures (`fixtures/`)

JSON files mirror API response shapes:

| File | Description |
|------|-------------|
| `users.json` | Demo accounts (`admin`, `viewer`) |
| `contributions.json` | 11 contributions across Mar–May 2026 |
| `expenses.json` | 10 expenses across categories |
| `dashboard-summary.json` | Expected totals per month |
| `monthly-trend.json` | Analytics trend series |
| `category-breakdown.json` | Expense totals by category per month |

Use these for frontend mocks, contract tests, or documentation without hitting the API.

## Seed database

Loads the same data into PostgreSQL (requires schema from `go run ./cmd/api` first).

```bash
chmod +x tests/seed.sh
./tests/seed.sh
```

**Demo credentials** (both use password `demo1234`):

| Username | Role | Access |
|----------|------|--------|
| `admin` | admin | Full CRUD |
| `viewer` | viewer | Read-only in UI |

`seed.sql` truncates `contributions` and `expenses` and upserts the two users.

## Tools

```bash
# Generate a bcrypt hash for a new seed password
go run tests/_tools/hashpass.go mypassword
```

## Frontend fixtures

Import JSON in Vitest or Storybook:

```ts
import contributions from '../../tests/fixtures/contributions.json'
```

Or point MSW/handlers at these files when running the UI without the API.
