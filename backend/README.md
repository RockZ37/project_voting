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

- Ensure Postgres is running and `DATABASE_URL` is set.
- Apply `database/schema.sql`:

```bash
pnpm migrate
```

- Optional: seed an admin user

```bash
pnpm seed:admin
```

Deployment:

See `DEPLOYMENT.md` for production setup steps.

