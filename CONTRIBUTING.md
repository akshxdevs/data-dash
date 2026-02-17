# Contributing

This project expects production-quality contributions: typed code, clear intent, and verifiable behavior.

## Development Workflow

1. Create a feature branch from `main`.
2. Keep changes scoped to a single concern (feature, fix, refactor, docs).
3. Run lint/build checks before opening a PR.
4. Open a pull request with context, impact, and validation evidence.

## Local Setup

```bash
npm install
npm run dev
```

Before pushing:

```bash
npm run lint
npm run build
```

## Branch Naming

Use one of:

- `feat/<short-description>`
- `fix/<short-description>`
- `chore/<short-description>`
- `docs/<short-description>`

## Commit Guidelines

- Write imperative, concise messages.
- Prefer Conventional Commit style:
  - `feat: add interval filtering for arena endpoint`
  - `fix: handle malformed webhook payloads`
  - `docs: add deployment runbook`

## Pull Request Checklist

- [ ] Scope and purpose are clear
- [ ] No unrelated changes included
- [ ] Lint and build pass locally
- [ ] API or behavior changes are documented
- [ ] Screenshots/GIF added for UI changes
- [ ] Security impact reviewed (if touching API/routes/network code)

## Code Standards

- TypeScript strictness first; avoid `any`
- Keep server/domain logic in `lib/`, UI in `components/`
- Make fallback behavior explicit for external dependencies
- Prefer small pure functions for transformations
- Avoid hidden side effects in shared modules

## Testing Expectations

Automated tests are not yet present in this repository. For now:

- Validate changed flows manually
- Include reproduction steps and expected results in the PR
- Add tests when introducing non-trivial logic (recommended next step)

## Documentation Expectations

If a change affects architecture, APIs, or operations:

- Update `README.md`
- Update relevant file in `docs/`
- Keep examples aligned to real route behavior

## Security Expectations

- Never commit secrets or tokens
- Use HTTPS for outbound integrations
- Validate and sanitize user-controlled input
- Document threat implications for new endpoints
