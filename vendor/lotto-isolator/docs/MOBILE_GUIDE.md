# Mobile App Guide

Owner: Gatuno Productions. Status: v2 draft. This document fixes the stack and the
working criteria for building the mobile app on top of `lotto-gate-core`.
Stack and architecture decisions are made by the owner. Open questions go to the owner
(see "Change process"). Do not substitute tools on your own.

## 1. Goal

A mobile app (iOS and Android, one codebase) where the user picks a game and a strictness
tier, and receives generated combinations, can save them, and later records the draw result
to track how each set performed.

The app is a client. All generation logic runs on our own server behind an API (section 4).

## 2. Stack (fixed)

| Layer | Choice | Notes |
|---|---|---|
| App | React Native with Expo, TypeScript strict | Expo is used as an open-source framework. Expo Router for navigation |
| Local storage | `expo-sqlite` | saved sets and results stay on the device in v1 |
| App builds | Local builds (`expo prebuild`, Gradle, Xcode, fastlane) | iOS builds need a Mac. Cloud build services only with owner approval |
| API | Node.js 22 and Fastify, TypeScript | |
| Hosting | One DigitalOcean Droplet (Ubuntu LTS), self-managed | see section 3 |
| Data (server) | Versioned JSON dataset or SQLite in v1. Self-hosted Postgres on our own server only if needed later | no hosted databases |
| Shared logic | `packages/core` (this repo's current `src/`) | plain TypeScript, no platform APIs |
| Tests | Vitest (core and API), Jest and React Native Testing Library (app) | |
| Lint and format | ESLint and Prettier, `tsc --noEmit` in CI | |
| CI | GitHub Actions (already in this repo) | leak check, lint, types, tests on every PR |

## 3. Infrastructure: self-managed only

Everything runs on infrastructure we control. No managed services and no platform-as-a-service.

Not allowed: Vercel, Netlify, Fly.io, Render, Railway, Heroku, Cloudflare Workers, Firebase,
Supabase, Neon, PlanetScale, DigitalOcean App Platform or Managed Databases, hosted auth
providers, hosted queues, third-party analytics. Anything not listed is also not allowed
unless the owner approves it.

Allowed: GitHub (repo and CI), DigitalOcean Droplets and their firewall, the Apple and Google
developer programs, Let's Encrypt, a DNS provider chosen by the owner.

Requirements for the server:
- Provisioning and updates are scripted and stored in the repo (`infra/`), so a new server can
  be rebuilt from scratch. How the service runs (Docker Compose or systemd) is the
  collaborator's proposal, to be approved by the owner before building.
- Reverse proxy (Caddy or Nginx) with automatic TLS. HTTP redirects to HTTPS.
- Hardening: SSH keys only, root login disabled, firewall (ufw) allowing only 22, 80, 443,
  fail2ban, unattended security updates, the service runs as a non-root user.
- Secrets live in an environment file on the server with restricted permissions, outside
  the repo. Deploys come from GitHub Actions over SSH with a dedicated deploy key.
- Automated, encrypted, tested backups of the data, with a documented restore procedure.
- Basic monitoring: uptime check and log access (journald or container logs).
- Separate staging and production (two Droplets, or two isolated services on one for v1).

## 4. Repository layout

Single monorepo (npm workspaces). Moving the current code into `packages/core` is task M0.

```
packages/core    existing filters, stats, sampler (keep API stable)
apps/api         Fastify service exposing /v1 endpoints
apps/mobile      Expo app
infra/           server provisioning and deploy scripts
docs/            this guide and API contract (OpenAPI)
```

## 5. Architecture rule: no engine in the app

Anything inside an app bundle can be extracted. Therefore:

- The mobile app contains UI, local storage, and an HTTP client. It contains no filters,
  scoring, sampling or strategy code and no draw-history dataset.
- The API owns generation. The app only sends a request and renders the answer.
- The engine behind the API is replaceable. v1 calls `packages/core`. Later the owner may
  plug in a different engine implementation behind the same interface, with no app change.

API contract v1 (document it in `docs/openapi.yaml` before implementing):

```
GET  /v1/games                       games, tiers, rules (display only)
POST /v1/generate  {game, tier, count}   -> {combos: number[][], generatedAt, engineVersion}
GET  /v1/draws/latest?game=          latest known draw, when available
GET  /healthz
```

Rules: validate every input with a schema, rate-limit per IP and per install ID, version the
API in the path, never return internal parameters or thresholds in responses or errors.

## 6. App scope for v1

1. Onboarding: age gate (legal age of the user's province), disclaimer acceptance.
2. Game and tier picker, then Generate, then results list.
3. Save a generated set. Saved sets list with date and game.
4. Enter the actual draw result for a saved set. The app shows matches per line.
5. Settings: language (English, French, Spanish), disclaimer, privacy policy, about.

Out of scope for v1: accounts, payments, push notifications, social features, ticket purchase.

## 7. Security criteria

- No secrets in the app. Anything shipped in the bundle is public. Use per-install IDs, not
  embedded keys, and treat the API as facing untrusted clients.
- Secrets live only on the server and in GitHub encrypted secrets. Never in the repo.
- TLS only. No cleartext traffic exceptions on Android or iOS.
- Keep dependencies few and well known. Every new dependency needs owner approval. No
  analytics, ads or tracking SDKs.
- Run `npm run leak-check` and tests before every push (the pre-push hook does this).

## 8. Store and legal criteria

- Positioning: a statistical tool for entertainment and research. Never claim or imply that
  it predicts draws or improves the odds of winning. Use the text in `DISCLAIMER.md`.
- Show the disclaimer at onboarding and in Settings.
- Age gate and responsible-play message are mandatory. Block use where the owner decides.
- Not affiliated with any lottery operator. Do not use operator names or logos in the
  app icon, name or store listing.
- Privacy policy URL and store data-safety forms are required for submission. Collect the
  minimum data. The owner approves the answers.
- Apple and Google have rules for lottery and gambling-related apps. The owner reviews the
  store listing and metadata before every submission.

## 9. Ownership and accounts

- Apple Developer, Google Play Console, DigitalOcean and domain accounts are owned by
  Gatuno Productions. The collaborator gets limited roles, never owner.
- All work stays in this repository and organization. Do not copy code into a personal
  or third-party repository, template, or deployment.
- Code is proprietary (see `LICENSE`). Contributions are covered by the confidentiality
  agreement signed with the owner.

## 10. Working with AI coding tools (Cursor and others)

AI tools are welcome. The repository is confidential, so:
- Cursor: enable Privacy Mode (no code retention or training) before opening this repo.
  Confirm the setting with the owner. The same applies to any other AI tool.
- `AGENTS.md` at the repo root holds the rules the AI must follow (stack, forbidden
  services, no engine in the app). Keep it up to date and do not delete it.
- Never paste secrets, server credentials or personal data into an AI tool.
- You are responsible for every line you commit. Review AI-generated code, run the tests,
  and do not add dependencies or services only because an AI suggested them.

## 11. Engineering criteria

- TypeScript strict, no `any` without a comment explaining why.
- Branch, then pull request, then owner review, then squash merge. No direct pushes to `main`.
- Small PRs, each with tests. CI must be green.
- Public functions in `packages/core` keep their signatures. Breaking changes need approval.
- Accessibility: dynamic text sizes, screen-reader labels, sufficient contrast.
- All user-facing strings go through i18n from the start (English, French, Spanish).
- Performance: results render under one second after the API replies. Handle offline and
  timeouts with clear messages.

## 12. Milestones

| # | Deliverable | Done when |
|---|---|---|
| M0 | Monorepo with `packages/core`, `apps/api`, `apps/mobile` skeletons | CI green, core tests still pass |
| M1 | Server: Droplet provisioned and hardened from scripts, TLS, backups, deploy from CI | rebuild from scratch works, owner approves infra proposal first |
| M2 | API: `/v1/games`, `/v1/generate`, `/healthz`, OpenAPI, deployed to staging | contract tests pass |
| M3 | App skeleton: navigation, i18n, API client, onboarding and age gate | runs on both platforms |
| M4 | Generate flow, saved sets, result entry and match tracking | end-to-end on a device |
| M5 | Store readiness: icons, listing, privacy policy, TestFlight and Play internal testing | owner sign-off |

## 13. Change process

Open an issue or ask the owner before changing the stack, adding a dependency or service,
changing the API contract, or touching anything in sections 3, 5, 7, 8 or 9.
