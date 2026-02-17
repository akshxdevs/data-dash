# Security

## Security Posture Summary

The application currently includes baseline transport/input controls but lacks authentication, authorization, and abuse controls on public APIs.

## Current Controls

### HTTP Security Headers

Defined in `next.config.ts`:

- `Content-Security-Policy: frame-ancestors ...`
- `X-Frame-Options: SAMEORIGIN` (production only)

### Webhook URL Validation

`POST /api/alerts/webhook` enforces:

- valid URL parsing
- `https://` protocol requirement

### Failure Isolation

Analytics endpoint fails over to local fallback data when upstream provider fails, reducing cascading outage risk from third-party dependencies.

## Gaps and Risks

- No authentication on public API routes
- No authorization model for alert relay usage
- No destination allowlist for webhook forwarding
- No explicit rate limiting or anti-abuse controls
- No centralized audit logging

## Hardening Roadmap

1. Add API authentication for non-public routes.
2. Add route-specific rate limiting (`/api/alerts/webhook` first).
3. Implement webhook destination allowlist and SSRF-focused validation.
4. Add request size limits and schema validation.
5. Add structured security logging + anomaly alerts.
6. Add dependency scanning in CI (SCA + advisories).

## Secure Coding Guidance

- Treat all request bodies and query params as untrusted.
- Validate and normalize inputs close to route boundaries.
- Avoid leaking internal errors through API responses.
- Keep error responses bounded and non-sensitive.

## Secret Management

No required secrets exist in current baseline.

If secrets are introduced:

- Store only in platform secret manager / encrypted env vars
- Rotate periodically and on exposure events
- Never commit secrets to repository history

## Dependency and Supply Chain

Recommended controls:

- lockfile verification in CI
- automated vulnerability checks on dependency updates
- minimal production dependency set
