# Data Dash

Crypto analytics dashboard built with Next.js App Router, React 19, and TypeScript.

Data Dash renders a memecoin-focused market dashboard from live CoinGecko data and falls back to deterministic demo-safe data when upstream requests fail. The same data layer powers the server-rendered home page and the public arena API.

## What It Does

- Server-renders the main dashboard from a typed analytics payload
- Tracks a fixed watchlist of memecoins across Dogecoin, Ethereum, and Solana ecosystems
- Derives sentiment, momentum, velocity, holder strength, whale pressure, heatmaps, and wallet flow views
- Exposes a cacheable JSON snapshot API at `/api/arena`
- Relays outbound alert payloads through `/api/alerts/webhook`
- Preserves contract shape when live provider calls fail by returning fallback data with `source: "fallback"`

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

## Local Development

### Requirements

- Node.js 20+
- npm 10+ or Bun
- Outbound access to `api.coingecko.com`

### Install

```bash
npm install
```

### Start the app

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

### Validate before shipping

```bash
npm run lint
npm run build
```

## Available Scripts

- `npm run dev` starts the local Next.js dev server
- `npm run dev:preview` starts the dev server on `0.0.0.0:3000`
- `npm run build` creates the production build
- `npm run start` serves the production build
- `npm run lint` runs ESLint

## API

### `GET /api/arena`

Returns an analytics snapshot for the requested interval and optional token subset.

Query params:

- `interval`: `1h`, `24h`, `7d`, or `30d` (`7d` by default)
- `ids`: comma-separated watchlist IDs such as `dogecoin,shiba-inu,pepe`

Example:

```bash
curl "http://localhost:3000/api/arena?interval=24h&ids=dogecoin,shiba-inu,pepe"
```

The route responds with cache headers:

- `public, max-age=60, s-maxage=60, stale-while-revalidate=240`

### `POST /api/alerts/webhook`

Forwards a JSON payload to an external HTTPS webhook URL.

Example:

```bash
curl -X POST "http://localhost:3000/api/alerts/webhook" \
  -H "content-type: application/json" \
  -d '{"url":"https://example.com/webhook","message":"threshold crossed"}'
```

If `payload` is omitted, the route sends a default object with `text` and `timestamp`.

Full request and response examples are documented in `docs/API.md`.

## Runtime Notes

- `app/page.tsx` uses `revalidate = 300`
- Provider fetches in `lib/live-analytics.ts` use Next.js revalidation hints
- No database, queue, or worker is currently required
- No environment variables are required for baseline operation

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API](docs/API.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Operations](docs/OPERATIONS.md)
- [Security](docs/SECURITY.md)
- [Contributing](CONTRIBUTING.md)

## Security

- Security headers are configured in `next.config.ts`
- Webhook forwarding only accepts `https://` destinations
- API routes do not currently implement authentication or rate limiting

## Current Limits

- Historical analytics are not persisted
- There is no committed automated test suite yet
- Provider access depends on CoinGecko availability unless fallback mode is used

## License

No license file is currently defined in this repository.
