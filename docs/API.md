# API Contracts

Base URL (local): `http://localhost:3000`

## GET `/api/arena`

Returns an analytics snapshot for the requested interval and optional token subset.

### Query Params

- `interval` (optional): `1h` | `24h` | `7d` | `30d`
  - Default: `7d`
- `ids` (optional): comma-separated watchlist IDs
  - Example: `dogecoin,shiba-inu,pepe`
  - If fewer than 3 valid IDs are supplied, server falls back to full watchlist.

### Example Request

```bash
curl "http://localhost:3000/api/arena?interval=24h&ids=dogecoin,shiba-inu,pepe"
```

### Success Response (200)

```json
{
  "interval": "24h",
  "tokens": [
    {
      "id": "dogecoin",
      "symbol": "DOGE",
      "name": "Dogecoin",
      "chain": "Dogecoin",
      "currentPrice": 0.16,
      "marketCap": 6200000000,
      "volume24h": 840000000,
      "holders": 191200,
      "whales": 73,
      "sentiment": 71,
      "socials": [54, 58, 63, 67, 65, 70, 71],
      "priceChange": [-1.2, 0.8, 1.4, 2.1, 1.8, 3.2, 2.6],
      "signal": {
        "momentum": 69,
        "velocity": 66,
        "holderStrength": 74,
        "whalePenalty": 38
      }
    }
  ],
  "weeklyWars": [{ "day": "Mon", "alpha": 30, "beta": 27, "gamma": 25 }],
  "heatMapRows": ["US", "EU", "Asia", "LATAM"],
  "heatMapCols": ["DOGE", "SHIB", "PEPE"],
  "heatMap": [[77, 72, 68]],
  "walletFlows": [{ "label": "Smart Wallets", "value": 142 }],
  "lastUpdated": "2026-02-17T00:00:00.000Z",
  "source": "live"
}
```

### Caching Behavior

Response headers:

- `cache-control: public, max-age=60, s-maxage=60, stale-while-revalidate=240`

### Failure Semantics

- Route attempts live provider reads.
- On provider failure, response still returns `200` with contract-complete fallback data and `source: "fallback"`.

## POST `/api/alerts/webhook`

Forwards a JSON payload to an external HTTPS webhook endpoint.

### Request Body

```json
{
  "url": "https://example.com/webhook",
  "message": "optional plain text",
  "payload": {
    "custom": "optional payload object"
  }
}
```

Rules:

- `url` is required and must be valid `https://`.
- If `payload` is omitted, server constructs:
  - `text`: `message` or default `"Data Dash alert triggered"`
  - `timestamp`: server ISO timestamp

### Example Request

```bash
curl -X POST "http://localhost:3000/api/alerts/webhook" \
  -H "content-type: application/json" \
  -d '{"url":"https://example.com/webhook","message":"threshold crossed"}'
```

### Responses

- `200`:

```json
{ "ok": true, "status": 200 }
```

- `400` invalid URL:

```json
{ "ok": false, "error": "Webhook URL must be a valid https URL" }
```

- `502` upstream delivery failure:

```json
{ "ok": false, "error": "Webhook request failed to reach destination" }
```

## Versioning

No explicit API versioning is implemented yet. If introducing breaking changes, prefer adding `/api/v1/*` routes rather than in-place contract mutation.
