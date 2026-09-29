# ADR-001: Monorepo Structure with Turborepo

**Date:** 2026-09-29  
**Status:** Accepted  
**Deciders:** Course TA (system owner)

## Context

The Lighthouse system has at minimum three concerns with different deployment lifetimes:
1. The web app (aput.ir) — deployed on Vercel continuously
2. The database schema — evolves with the app
3. The judge (Phase 2) — separate deployment lifecycle, different runtime

We considered: separate repos per concern, a simple flat repo, or a monorepo.

## Decision

**Turborepo monorepo** with the following structure:

```
lighthouse/
├── apps/
│   ├── web/       ← Next.js 15 — primary app
│   └── judge/     ← STUB — Phase 2 only
└── packages/
    ├── db/        ← Drizzle schema + migrations (shared)
    └── ui/        ← Shared component wrappers
```

Package manager: **Bun** (consistent with Manova workspace conventions).

## Rationale

- **Phase 1 full-stack coherence**: web UI, TA dashboard, DB schema, and auth change together constantly. A single repo means agents can trace from UI component to DB schema to server action in one context pass.
- **Phase 2 is isolated by path, not by repo**: `apps/judge/` can be extracted to its own repo later without changing the rest. Path isolation is sufficient now.
- **AI-agent friendliness**: single repo = single context = dramatically better agent accuracy on cross-cutting changes.
- **Turborepo caching**: `bun run build` only rebuilds changed packages.

## Consequences

- **Good**: Zero cross-repo coordination friction during rapid Phase 1 development.
- **Good**: Shared `packages/db` schema ensures web and judge (Phase 2) can't drift out of sync.
- **Trade-off**: `apps/judge/` must be treated as a stub in Phase 1. Agents must not expand it.
- **Mitigation**: `AGENTS.md` and agent-routing.yaml explicitly gate the judge path with a Phase 2 boundary note.
