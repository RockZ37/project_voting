CivicVote Backend

Express + TypeScript backend for authentication, student identity, elections, registry, voting, verification, and audit APIs.

Quick start (from repo root):

```bash
cd backend
pnpm install
pnpm dev
```

The dev script uses `tsx` to run TypeScript directly. The server exposes a health endpoint:

- `GET /health` → { status: "ok" }

Run checks:

```bash
pnpm lint
pnpm test
```

Core API routes:

- `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- `POST /students`, `GET /students/index/:indexNumber`, `GET /students/me`, `PATCH /students/:id`
- `POST /elections`, `GET /elections`, `GET /elections/:id`, `PATCH /elections/:id`, `DELETE /elections/:id`
- `POST /elections/:id/candidates`, `GET /elections/:id/candidates`, `PATCH /elections/candidates/:candidateId`, `DELETE /elections/candidates/:candidateId`
- `GET /voters`, `POST /voters`, `POST /voters/import-csv`, `PATCH /voters/:id`
- `POST /verification/start`, `POST /verification/:id/complete`, `GET /verification/:id`
- `POST /votes/cast`, `GET /votes/elections/:electionId/results`
- `GET /audit-logs` (admin only)

Database setup:

By default, the application uses **SQLite** for local development. No additional database server setup is required.

### SQLite (default):

```bash
pnpm migrate    # Creates schema in ./data/civicvote.db
pnpm seed:admin # Creates admin user (optional)
pnpm dev        # Starts server with SQLite
```

### PostgreSQL (optional):

To use PostgreSQL instead, set these environment variables:

```bash
# In .env or .env.local:
USE_SQLITE=false
DATABASE_URL=postgres://user:password@localhost:5432/civicvote
DATABASE_SSL=false  # Set to true for Supabase or other hosted databases
```

Then run the migration:

```bash
pnpm migrate
```

- Ensure Postgres is running, or point `DATABASE_URL` at a hosted PostgreSQL service such as Supabase.
- Set `DATABASE_SSL=true` for hosted databases that require TLS.
- Apply database schema:

```bash
pnpm migrate
```

- Optional: seed an admin user

```bash
pnpm seed:admin
```

Deployment:

See `DEPLOYMENT.md` for production setup steps.

