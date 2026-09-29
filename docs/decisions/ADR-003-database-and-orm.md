# ADR-003: Database — Neon (Serverless Postgres) + Drizzle ORM

**Date:** 2026-09-29  
**Status:** Accepted  
**Deciders:** Course TA (system owner)

## Context

The system needs to store: users, courses, chapters, missions, assessments (scores), world state, crews, and Ship's Log entries. Phase 1 traffic is very light (30-100 students, 1 TA team).

Options considered:
1. Neon (serverless Postgres)
2. Supabase (Postgres + BaaS)
3. Self-hosted Postgres (VPS)
4. PlanetScale (MySQL-compatible)

## Decision

**Neon** for the database host, **Drizzle ORM** for schema + query layer.

## Rationale

**Neon:**
- Serverless Postgres — zero ops, free tier covers Phase 1 comfortably
- Native Vercel integration (environment variables auto-provisioned)
- Scales down to zero between requests (no idle cost)
- Full Postgres semantics — no query limitations like PlanetScale

**Drizzle ORM:**
- Type-safe schema in TypeScript — schema serves as both migration source and runtime types
- `packages/db` as a shared package means web and judge (Phase 2) import the same schema
- Lightweight — no heavy runtime, works in Vercel Edge runtime if needed
- `db:push` for fast iteration, `db:generate` for proper migration files in production

**Supabase rejected:** We're already using Auth.js for auth — Supabase Auth would create a competing auth system. Supabase BaaS features aren't needed for Phase 1.

**Self-hosted rejected:** Adds operational burden. The course is temporary (one semester); we want zero maintenance.

## Schema Design Principles

1. **Internal domain names, not nautical names**: `Assessment`, `Course`, `Mission`, `Enrollment` in code. Nautical theme is in the UI only. This keeps the code readable and the story evolvable.
2. **Assessment states as enum**: `draft | published | revised` — never implicit nulls for "no score."
3. **Landmark state as computed-then-stored**: `LandmarkState` is updated atomically on Assessment publish. No on-the-fly computation at request time.
4. **Audit trail on Assessment**: `published_by`, `published_at`, `revised_by`, `revised_at`, `revision_reason` — required for academic integrity.
5. **ShipLog as event table**: immutable records, never edited. Narrates class milestones.

## Consequences

- **Good**: Zero ops, auto-scales, free for Phase 1 (and likely Phase 2).
- **Good**: Full Postgres — joins, transactions, enums, JSONB all available.
- **Good**: Drizzle schema is the single source of truth — TypeScript types generated automatically.
- **Trade-off**: Neon connection pooling needed for serverless (use `@neondatabase/serverless` driver with `neon()` adapter for Drizzle — not `pg`).
- **Trade-off**: If Phase 2 judge runs as a long-lived process (not serverless), it should use a standard `pg` pool connection, not the HTTP-mode Neon driver.
