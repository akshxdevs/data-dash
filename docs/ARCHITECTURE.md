# Architecture

## System Overview

Data Dash is a server-rendered analytics application with two backend-facing responsibilities:

- Aggregate and transform market data for dashboard rendering
- Relay alert payloads to external webhook destinations

Core flow:

1. UI requests dashboard data (server-rendered page or `/api/arena`).
2. `lib/live-analytics.ts` fetches market + chart data from CoinGecko.
3. Domain transformations compute sentiment, signals, heatmaps, and wallet flows.
4. If provider calls fail, fallback dataset is returned with `source: "fallback"`.
5. UI components render typed dashboard sections from the normalized payload.

## Runtime Topology

- Frontend + API routes run in the same Next.js application.
- No database dependency in current architecture.
- No queue or background worker in current architecture.

## Modules

- `app/page.tsx`
  - SSR entry point for dashboard shell
  - Fetches initial dashboard data and watchlist
- `app/api/arena/route.ts`
  - API endpoint for interval/id-filtered analytics snapshots
- `app/api/alerts/webhook/route.ts`
  - API endpoint for outbound webhook forwarding
- `lib/live-analytics.ts`
  - Domain and integration layer:
    - provider fetches
    - series sampling
    - derived signal scoring
    - fallback orchestration
- `components/dashboard/*`
  - Presentational and container components for dashboard views

## Data Sources and Resilience

- Primary provider: CoinGecko public endpoints
- Strategy:
  - Request live data with Next.js revalidation hints
  - Fail closed into static fallback payload
  - Preserve contract shape regardless of source

This ensures UI continuity and demo reliability under provider degradation.

## Caching and Revalidation

- `app/page.tsx` exports `revalidate = 300` (5 minutes) for page-level ISR behavior.
- Upstream fetches in `lib/live-analytics.ts` use `next: { revalidate: 300 }`.
- `/api/arena` adds response caching headers:
  - `max-age=60`
  - `s-maxage=60`
  - `stale-while-revalidate=240`

## Security Boundaries

- App-level security headers in `next.config.ts`
- Webhook URL validation enforces HTTPS scheme
- No inbound authentication layer yet for API routes (explicit risk)

See `docs/SECURITY.md` for hardening priorities.

## Current Constraints

- No persistence layer for historical analytics snapshots
- No authn/authz for API consumers
- No formal rate limiting for webhook relay endpoint
- No automated test suite committed yet

## Recommended Evolution

1. Introduce provider abstraction with retry policy + circuit breaker.
2. Add request authentication and per-route rate limits.
3. Add structured logs + request IDs for traceability.
4. Add integration tests for route contracts and fallback behavior.
