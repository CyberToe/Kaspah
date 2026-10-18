# AGENTS.md

Rules for AI coding tools (Cursor, Claude Code, etc.) working in this repository.
Full details: `docs/MOBILE_GUIDE.md`. This repository is proprietary and confidential.

## Stack (fixed, do not substitute)
- App: React Native with Expo, TypeScript strict, Expo Router, `expo-sqlite`.
- API: Node.js 22 and Fastify, TypeScript, tested with Vitest.
- Hosting: one self-managed DigitalOcean Droplet. Nothing else.
- Monorepo with npm workspaces: `packages/core`, `apps/api`, `apps/mobile`, `infra`.

## Hard rules
- Do not use managed services or platforms: no Vercel, Netlify, Fly.io, Render, Railway,
  Firebase, Supabase, Neon, hosted databases, hosted auth, or analytics/tracking SDKs.
- The mobile app must not contain filter, scoring, sampling or strategy code, or draw
  history data. It only calls the API.
- Never put secrets, keys, tokens or `.env` files in the repo or in the app bundle.
- Do not add dependencies or services without owner approval. Ask first.
- Keep the copyright header in every source file. Do not edit `LICENSE`.
- Never claim in UI text that the app predicts draws or improves the odds of winning.
- Do not copy code in from, or out to, other projects or repositories.

## Workflow
- Work on a branch and open a pull request. Never push directly to `main`.
- Before every push: `npm run prepush`.
- Keep public functions in `packages/core` backward compatible.
- When unsure about scope, stack or architecture, stop and ask the owner.
