# Data Dash

Production-ready crypto analytics dashboard built with Next.js App Router, React 19, and TypeScript.

Data Dash aggregates market data, derives directional signals, and renders a realtime-style dashboard focused on high-volatility assets. The app is designed to degrade gracefully: when live providers fail, it serves deterministic fallback data so the UI remains stable and demo-safe.

## Highlights

- Live + fallback data pipeline for resilient dashboards
- REST endpoints for analytics snapshots and outbound webhook alerts
- Typed domain models across server and UI layers
- Server-side rendering with incremental revalidation
- Security headers configured at the framework boundary

## Tech Stack

- Framework: Next.js 16 (App Router)
- Runtime: Node.js
- UI: React 19
- Language: TypeScript
- Linting: ESLint 9
- Styling: Tailwind CSS v4 (PostCSS integration)
- Market Data: CoinGecko public API

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+ (or Bun, pnpm, yarn)

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

App will be available at `http://localhost:3000`.

### Validate

```bash
npm run lint
npm run build
```

## Scripts

- `npm run dev`: local development server
- `npm run dev:preview`: bind server to `0.0.0.0:3000`
- `npm run build`: production build
- `npm run start`: run production server
- `npm run lint`: lint the codebase

## API Surface

- `GET /api/arena?interval=7d&ids=dogecoin,shiba-inu`
  - Returns dashboard payload (`source` is `live` or `fallback`)
  - Response is cached (`max-age=60`, `stale-while-revalidate=240`)
- `POST /api/alerts/webhook`
  - Validates HTTPS destination
  - Forwards payload to external webhook endpoint

Detailed contracts: `docs/API.md`.

## Project Structure

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

## Documentation

- Architecture: `docs/ARCHITECTURE.md`
- API contracts: `docs/API.md`
- Deployment guide: `docs/DEPLOYMENT.md`
- Observability and operations: `docs/OPERATIONS.md`
- Security model: `docs/SECURITY.md`
- Contribution workflow: `CONTRIBUTING.md`

## Security

- Global CSP frame policy and `X-Frame-Options` in production (`next.config.ts`)
- Webhook endpoint enforces HTTPS URLs
- No secrets currently required for baseline operation

For policy and hardening guidance, see `docs/SECURITY.md`.

## Roadmap (Suggested)

- Add provider abstraction and retries with circuit breaking
- Introduce structured logging and distributed trace correlation
- Add integration tests for API routes and fallback behavior
- Add rate limiting and request authentication for alert webhooks

## License

No license file is currently defined in this repository.
