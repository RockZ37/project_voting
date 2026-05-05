CivicVote Backend (scaffold)

This folder contains a minimal Express + TypeScript backend scaffold to be expanded.

Quick start (from repo root):

```bash
cd backend
pnpm install
pnpm dev
```

The dev script uses `tsx` to run TypeScript directly. The server exposes a health endpoint:

- `GET /health` → { status: "ok" }

Next steps:

- install a database (Postgres recommended)
 - run migrations or apply `database/schema.sql` (example: `pnpm migrate`)
- implement authentication, student identity, elections, registry, votes

