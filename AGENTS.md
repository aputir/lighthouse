# Lighthouse — Harbor World (aputir)

Monorepo for the APUT course gamification system. Domain: `aput.ir`. GitHub Org: `aputir`.

> AP course — University of Tehran, CS Department — Autumn 2026

---

## Routing

Read `docs/guides/agent-routing.yaml` once per Research phase. Path globs first, then keywords.

| Path | Scope |
|------|-------|
| `apps/web/src/app/(staff)/` | TA dashboard — score entry, course management, world control |
| `apps/web/src/app/(student)/` | Student views — dashboard, missions, crew, harbor |
| `apps/web/src/app/(public)/` | Public harbor map, login, leaderboard |
| `apps/web/src/app/api/` | API routes (use server actions instead where possible) |
| `packages/db/` | Drizzle ORM schema, migrations, seed data |
| `packages/ui/` | Shared design system components |
| `apps/judge/` | **PHASE 2 STUB** — do not implement, do not expand |
| `docs/decisions/` | ADRs — read when making architectural decisions |
| `docs/superpowers/specs/` | Design documents |

## Context Budget

| Tier | When | Load |
|------|------|------|
| **Trivial** | Typo, one-liner, obvious single-file fix | The file only |
| **Standard** | Feature, multi-file, component | Route docs + schema |
| **Strategic** | New module, ADR, cross-app change | Route + ADRs + spec |

## Stack

- **Framework:** Next.js 15 (App Router) — TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **ORM:** Drizzle ORM — `packages/db`
- **Database:** Neon (serverless Postgres)
- **Auth:** Auth.js v5 — credentials provider (email + password), invite-only
- **i18n:** next-intl — Persian primary (`fa`), English secondary (`en`)
- **Monorepo:** Turborepo + Bun
- **Deploy:** Vercel (web) + Neon (DB)
- **Linting:** Biome

## Commands

```bash
# Install dependencies
bun install

# Dev server
bun run dev

# Type check
bun run typecheck

# Lint (Biome)
bun run lint

# Tests
bun test

# DB: push schema
bun --filter @lighthouse/db run db:push

# DB: generate migration
bun --filter @lighthouse/db run db:generate
```

## Roles

| Role | Access |
|------|--------|
| `owner` | Full — head TA / course admin. Seed only. |
| `staff` | TA dashboard: grades, missions, roster, world preview |
| `student` | Personal progress, crew, harbor map (read-only) |
| (public) | Harbor map, optional leaderboard — no auth needed |

## Domain Model (Quick Reference)

```
Course → Chapter → Mission → Assessment
Course → Enrollment → User
Course → Crew → User (crew members)
Course → LandmarkState (8 landmarks × 4 stages)
Assessment.published → triggers LumenDelta → LandmarkState update → ShipLog
```

## Key Design Decisions

- **Score → World (fully automatic):** Publishing scores automatically computes Lumens, updates landmark stages, and creates Ship's Log entries. No manual world management by TAs.
- **Three separate progress dimensions:** Chapters (teaching units), Restoration Stages (class harbor progress), Keeper Ranks (individual). Never conflate them.
- **Invite-only registration:** No public sign-up. TAs create invites per student.
- **Phase 2 is out of scope:** `apps/judge/` is a stub. Do not build execution infrastructure in Phase 1.
- **Persian primary:** All UI labels must have `fa` translations. Use Persian numerals in `fa` locale.

## Delivery Rules

- **No direct push to `main`.** Branch-first: `feat/`, `fix/`, `refactor/`
- **PR-only merges** via GitHub
- **Conventional Commits:** `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
- **Biome** for formatting and linting — run `bun run lint` before PR
- **Ask before commit** unless the user explicitly requested a commit

## Agent Subagent Tiering

| Tier | Tasks | Model |
|------|-------|-------|
| Scout | File search, grep, schema read, symbol location | `flash` |
| Implementer | Multi-file features, migrations, complex logic | `inherit`/`pro` |

## Workspace Synchronization (Mandatory)

When any agent adds, modifies, or removes any app, package, port allocation, or infrastructure config in this repo, it **MUST** update `WORKSPACE_INDEX.md` in the same turn/PR.

## Persian Copy Rules

- Site chrome is bilingual: `messages/fa.json` (primary) and `messages/en.json`
- Do not gloss Persian with English in parentheses
- Display numbers with Persian digits in `fa` locale; ASCII digits for copy/clipboard
- World lore (landmark names, Ship's Log) must have both `fa` and `en` versions

## Canonical Documentation

- **Design Spec:** [`docs/superpowers/specs/2026-09-29-lighthouse-harbor-world-design.md`](docs/superpowers/specs/2026-09-29-lighthouse-harbor-world-design.md)
- **ADRs:** `docs/decisions/`
- **Delivery Guide:** `docs/guides/delivery.md`
