# Backend Deployment

This backend is an Express + TypeScript service with PostgreSQL.

## 1) Environment Variables

Set these variables in your runtime:

- `NODE_ENV=production`
- `PORT=4000` (or your platform-assigned port)
- `DATABASE_URL=postgres://...`
- `SESSION_SECRET=<long-random-secret>`
- `FRONTEND_ORIGIN=https://your-frontend-domain`

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

- Restrict database network access to trusted hosts.
- Rotate `SESSION_SECRET` periodically.
- Enable regular PostgreSQL backups.
- Monitor response codes for spikes in `401`, `403`, and `429`.

## 5) Smoke Test

```bash
curl -s http://localhost:4000/health
```

Expected JSON includes `status: "ok"`.
