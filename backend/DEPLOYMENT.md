# Backend Deployment

This backend is an Express + TypeScript service supporting both SQLite (development) and PostgreSQL (production).

## 1) Environment Variables

Set these variables in your runtime:

- `NODE_ENV=production`
- `PORT=4000` (or your platform-assigned port)
- `SESSION_SECRET=<long-random-secret>`
- `FRONTEND_ORIGIN=https://your-frontend-domain`

### Database Configuration

**For SQLite (development/testing):**
- `USE_SQLITE=true`
- `SQLITE_PATH=./data/civicvote.db` (optional, defaults shown)

**For PostgreSQL (production recommended):**
- `USE_SQLITE=false`
- `DATABASE_URL=postgres://...`
- `DATABASE_SSL=true` (for hosted services like Supabase)

## 2) Build and Start

```bash
pnpm install --frozen-lockfile
pnpm migrate
pnpm build
pnpm start
```

## 3) Reverse Proxy / TLS

- Terminate TLS at your edge/load balancer.
- Forward `X-Forwarded-For` so IP-based protections have meaningful data.
- Keep cookies `httpOnly`; `secure` is already enabled when `NODE_ENV=production`.

## 4) Operational Checklist

- **Database**: For production, use PostgreSQL with proper backups and access controls. SQLite is suitable for development/testing but should not be used in production for multi-user scenarios.
- Restrict database network access to trusted hosts (PostgreSQL only).
- Rotate `SESSION_SECRET` periodically.
- Enable regular backups (database backups for PostgreSQL, file backups for SQLite).
- Monitor response codes for spikes in `401`, `403`, and `429`.

## 5) Smoke Test

```bash
curl -s http://localhost:4000/health
```

Expected JSON includes `status: "ok"`.
