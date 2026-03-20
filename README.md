# Data Dash

Server-rendered memecoin analytics dashboard with CoinGecko-backed snapshots, typed fallback data, and an HTTPS webhook relay.

![Next.js 16.1.6](https://img.shields.io/badge/Next.js-16.1.6-000000?logo=nextdotjs)
![React 19.2.3](https://img.shields.io/badge/React-19.2.3-20232a?logo=react)
![TypeScript 5](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss&logoColor=white)

## Overview

Data Dash is a small full-stack Next.js application. The home page and `GET /api/arena` both use the same typed analytics pipeline in `lib/live-analytics.ts`, which:

- fetches market and chart data for a fixed watchlist from CoinGecko
- derives sentiment, momentum, velocity, holder-strength, whale-pressure, heat-map, and wallet-flow views
- returns contract-complete fallback data when provider requests fail

The repository also exposes `POST /api/alerts/webhook`, a simple HTTPS-only webhook relay for forwarding alert payloads.

## Features

- Server-rendered dashboard at `/` with 5-minute revalidation
- Public JSON snapshot API at `/api/arena`
- Interval support for `1h`, `24h`, `7d`, and `30d`
- Optional token filtering with a minimum-three-token guardrail before falling back to the full watchlist
- Shared live/fallback data contract across the UI and API
- HTTPS validation for outbound webhook destinations

## Stack

- Next.js 16.1.6
- React 19.2.3
- TypeScript 5
- Tailwind CSS 4
- ESLint 9
- CoinGecko public API

## Project Layout

```txt
app/
  api/
    alerts/webhook/route.ts
    arena/route.ts
  layout.tsx
  page.tsx
components/dashboard/
lib/
  live-analytics.ts
utils/
docs/
```

## Requirements

- Node.js 20+
- npm 10+ or Bun
- Outbound access to `api.coingecko.com`

## Development

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

Preview on `0.0.0.0:3000`:

```bash
npm run dev:preview
```

Run validation:

```bash
npm run lint
npm run build
```

The local app runs at `http://localhost:3000`.

## Configuration

No environment variables are required for baseline operation.

The existing docs mention future optional variables such as `COINGECKO_API_KEY`, `ALERT_WEBHOOK_ALLOWLIST`, and `LOG_LEVEL`, but those are not currently consumed by the application code.

## API

### `GET /api/arena`

Returns an analytics snapshot for the requested interval and optional token subset.

Query parameters:

- `interval`: `1h`, `24h`, `7d`, or `30d` (`7d` by default)
- `ids`: comma-separated watchlist IDs such as `dogecoin,shiba-inu,pepe`

If fewer than three valid IDs are supplied, the route falls back to the full watchlist.

Example:

```bash
curl "http://localhost:3000/api/arena?interval=24h&ids=dogecoin,shiba-inu,pepe"
```

Response caching:

- `cache-control: public, max-age=60, s-maxage=60, stale-while-revalidate=240`

If CoinGecko requests fail, the route still returns `200` with `source: "fallback"`.

### `POST /api/alerts/webhook`

Forwards a JSON payload to an external HTTPS webhook URL.

Example:

```bash
curl -X POST "http://localhost:3000/api/alerts/webhook" \
  -H "content-type: application/json" \
  -d '{"url":"https://example.com/webhook","message":"threshold crossed"}'
```

Rules:

- `url` is required and must use `https://`
- when `payload` is omitted, the route sends a default object with `text` and `timestamp`

Full request and response examples are in [docs/API.md](docs/API.md).

## Architecture Notes

- [`app/page.tsx`](app/page.tsx) server-renders the dashboard shell and exports `revalidate = 300`
- [`lib/live-analytics.ts`](lib/live-analytics.ts) contains the provider fetches, data shaping, scoring logic, and fallback orchestration
- [`app/api/arena/route.ts`](app/api/arena/route.ts) exposes the cacheable analytics snapshot API
- [`app/api/alerts/webhook/route.ts`](app/api/alerts/webhook/route.ts) handles outbound webhook forwarding

The app is stateless today. There is no database, queue, background worker, or committed automated test suite in this repository.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API](docs/API.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Operations](docs/OPERATIONS.md)
- [Security](docs/SECURITY.md)

## Security Notes

- `next.config.ts` sets a `Content-Security-Policy` `frame-ancestors` header and adds `X-Frame-Options: SAMEORIGIN` outside development
- the webhook relay validates URL parsing and enforces `https://`
- public API routes do not currently implement authentication, authorization, or rate limiting

## License

No license file is currently defined in this repository.
