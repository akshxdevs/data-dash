# Deployment Guide

## Deployment Targets

This app is compatible with any Node.js hosting platform that supports Next.js standalone/server mode (Vercel, Fly.io, Render, container platforms, Kubernetes).

## Runtime Requirements

- Node.js 20+
- Outbound internet access to `api.coingecko.com`
- HTTPS termination at edge/load balancer

## Environment Variables

No required environment variables currently exist for baseline operation.

Recommended future additions:

- `COINGECKO_API_KEY` (if moving to authenticated provider tier)
- `ALERT_WEBHOOK_ALLOWLIST` (comma-separated destination domains)
- `LOG_LEVEL` (`info`, `warn`, `error`, `debug`)

## Build and Start

```bash
npm install
npm run build
npm run start
```

Default app port:

- `3000` (override with `PORT`)

## Pre-Deployment Checklist

- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] `/api/arena` returns valid payload in staging
- [ ] `/api/alerts/webhook` validated against non-production receiver
- [ ] Security headers validated in deployment environment
- [ ] Rollback strategy documented

## Health Verification

After deploy:

1. Verify home page renders and charts populate.
2. Request:
   - `GET /api/arena?interval=7d`
3. Validate response contains:
   - non-empty `tokens`
   - `source` field (`live` or `fallback`)
4. Run synthetic webhook test on:
   - `POST /api/alerts/webhook`

## Rollback Strategy

- Keep previous stable build artifact available.
- Roll back on:
  - repeated 5xx on main route or API routes
  - severe latency regressions
  - security header misconfiguration

## Performance Notes

- Dashboard page and provider fetches revalidate at 300s intervals.
- `/api/arena` adds explicit cache headers for short-lived edge/client reuse.

If traffic increases materially, consider:

- response caching at CDN edge
- server-side rate limiting
- provider request coalescing
