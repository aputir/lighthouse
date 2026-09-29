# Delivery Guide

## Branch Workflow

Every code change lives on a dedicated branch. Never push directly to `main`.

```bash
# Start a feature
git checkout -b feat/score-grid

# Make changes, then commit
git add -A
git commit -m "feat: add keyboard-navigable score grid for TAs"

# Push and open PR
git push origin feat/score-grid
```

## Commit Conventions (Conventional Commits)

| Prefix | When |
|--------|------|
| `feat:` | New feature or behavior |
| `fix:` | Bug fix |
| `refactor:` | Restructuring without behavior change |
| `docs:` | Documentation only |
| `chore:` | Tooling, deps, config |
| `test:` | Tests only |
| `style:` | Formatting only (no logic) |

Breaking changes: `feat!:` or `fix!:` with `BREAKING CHANGE:` in the body.

## PR Checklist

Before opening a PR:

- [ ] `bun run typecheck` passes
- [ ] `bun run lint` passes (Biome)
- [ ] `bun test` passes (or new tests added for new logic)
- [ ] New UI strings have `fa` + `en` entries in `messages/`
- [ ] `WORKSPACE_INDEX.md` updated if you added/removed an app or package
- [ ] No direct DB calls from components — use server actions or API routes

## Quality Gates

```bash
# All of these must pass before PR merge:
bun run typecheck          # TypeScript — no errors
bun run lint               # Biome — no errors
bun test                   # Unit tests — all pass

# DB work:
bun --filter @lighthouse/db run db:generate   # Generate migration
bun --filter @lighthouse/db run db:push       # Push to dev Neon branch
```

## Dev Environment Setup

```bash
# 1. Clone
git clone https://github.com/aputir/lighthouse
cd lighthouse

# 2. Install
bun install

# 3. Env
cp apps/web/.env.example apps/web/.env.local
# Fill in: DATABASE_URL (Neon), NEXTAUTH_SECRET, NEXTAUTH_URL

# 4. Push schema to dev DB
bun --filter @lighthouse/db run db:push

# 5. Seed (creates owner account)
bun --filter @lighthouse/db run db:seed

# 6. Run
bun run dev
# → http://localhost:3000
```

## Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `DATABASE_URL` | Neon console | Postgres connection string (pooled) |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | Auth.js JWT signing secret |
| `NEXTAUTH_URL` | `http://localhost:3000` | Base URL for Auth.js callbacks |
| `OWNER_EMAIL` | Seed config | Initial owner account email |
| `OWNER_PASSWORD` | Seed config | Initial owner account password |

## Agent Instructions

Agents: read `AGENTS.md` first. Load `docs/guides/agent-routing.yaml` to find relevant docs for the task. Respect context budget tiers. Update `WORKSPACE_INDEX.md` if you add or remove any app/package.
