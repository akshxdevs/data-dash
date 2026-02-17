# Operations Runbook

## Service Ownership

Current service scope:

- Dashboard rendering (`/`)
- Arena data API (`/api/arena`)
- Alert relay API (`/api/alerts/webhook`)

## Operational SLOs (Suggested)

- Availability:
  - `99.9%` monthly for dashboard route and API availability
- Latency:
  - p95 `< 800ms` for `GET /api/arena` under normal upstream conditions
- Error rate:
  - `< 1%` 5xx responses for public routes

## What to Monitor

- Request count and status codes by route
- p50/p95/p99 latency by route
- Upstream provider failure rate (CoinGecko non-2xx/timeouts)
- Fallback usage rate (`source: "fallback"` frequency)
- Webhook delivery success ratio for `/api/alerts/webhook`

## Logging (Current + Recommended)

Current codebase does not include a structured logging framework.

Recommended implementation:

- Structured JSON logs
- Per-request correlation ID
- Event fields:
  - `route`
  - `status_code`
  - `duration_ms`
  - `upstream_status`
  - `source` (`live` or `fallback`)

## Incident Playbooks

### High fallback rate on `/api/arena`

1. Confirm CoinGecko availability and latency.
2. Check outbound networking from hosting environment.
3. Verify no recent deployment changed data mapping/parsing.
4. If provider degraded, keep service on fallback and communicate status.

### Elevated 5xx on `/api/alerts/webhook`

1. Check destination endpoint health.
2. Validate request payload shape and URL quality.
3. Confirm DNS and TLS resolution from host environment.
4. Apply temporary destination allowlist or retry policy if abuse is suspected.

### Dashboard latency regression

1. Compare server compute time vs upstream API time.
2. Review provider timeout/retry behavior.
3. Ensure cache/revalidation headers are intact.
4. Roll back recent changes if regression is release-correlated.

## Capacity and Scaling

Baseline is stateless and horizontally scalable.

If traffic grows:

- Enable autoscaling on request/CPU thresholds
- Add route-level rate limits
- Use regional edge caching for `/api/arena`
- Introduce provider request deduplication
