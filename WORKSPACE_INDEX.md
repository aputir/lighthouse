<!--
LIGHTHOUSE WORKSPACE KNOWLEDGE INDEX (MULTI-RESOLUTION)
MANDATORY FOR ALL AI AGENTS:
Whenever you add, modify, or deprecate any app, package, service, port allocation,
or architectural pattern in this repo, you MUST update this file in the same turn/PR.
Keep entries concise, dense, and factual.
-->

# apps/

## [apps.web]
- **Aliases**: web, frontend, next, nextjs, harbor, website, aput.ir
- **Path**: `apps/web/`
- **Package**: `@lighthouse/web`
- **Port**: `3000` (dev server: `bun run dev`)
- **Short**: Next.js 15 App Router — Harbor World course platform for students and TAs.
- **Card**:
  Persian-primary (fa) + English (en) bilingual course website.
  Public routes: harbor map, login, leaderboard.
  Student routes (auth): dashboard, missions, crew, harbor.
  Staff routes (staff role): grades grid, roster, course management, world preview.
  Stack: Next.js 15, TypeScript, Tailwind CSS v4, @lighthouse/ui (@manovaspace/ui + @manovaspace/tokens), Auth.js v5, next-intl.
  Commands: `bun run dev` (starts on port 3000), `bun run build`, `bun run typecheck`, `bun run lint`.
  Deploy: Vercel. Domain: aput.ir.
- **See**: packages.db, packages.ui

## [apps.judge]
- **Aliases**: judge, arena, regatta, code-runner, submission
- **Path**: `apps/judge/`
- **Package**: `@lighthouse/judge`
- **Short**: **PHASE 2 STUB — NOT IMPLEMENTED.** Future code execution judge for student submissions.
- **Card**:
  Reserved for Phase 2: automated code judging, bot arenas (Regatta).
  Do not implement or expand in Phase 1.
  Will integrate with the same Assessment/Lumen system via the published assessment API.

# packages/

## [packages.db]
- **Aliases**: db, database, schema, drizzle, migrations, neon
- **Path**: `packages/db/`
- **Package**: `@lighthouse/db`
- **Short**: Drizzle ORM schema, migrations, and seed data. Targets Neon (serverless Postgres).
- **Card**:
  Core entities: Course, Chapter, Mission, Assessment, User, Invite, Enrollment,
  Crew, LandmarkState, ClassProgress, ShipLog.
  Assessment states: draft → published → revised.
  LandmarkState: 8 landmarks × 4 stages (dormant/under_restoration/operational/flourishing).
  Lumen computation is triggered server-side on Assessment publish.
  Stack: Drizzle ORM, @neondatabase/serverless, drizzle-kit, TypeScript.
  Scripts: db:push (schema push), db:generate (migration), db:seed, typecheck.
- **See**: apps.web

## [packages.ui]
- **Aliases**: ui, components, design-system, manova
- **Path**: `packages/ui/`
- **Short**: Manova/Goldstein design system integration and Lighthouse domain components.
- **Card**:
  Re-exports `@manovaspace/ui` primitives, composed components, shell components, and icons.
  Design tokens: `@manovaspace/tokens` (Tailwind CSS v4 custom properties).
  Domain components: LandmarkStageBadge.
  RTL-compatible (Tailwind logical properties for Persian layout).

# Domain Model

## [domain.assessment-pipeline]
- **Aliases**: scoring, lumens, publish, grade, world-update
- **Short**: The pipeline from score entry to world state update.
- **Card**:
  1. TA enters scores → Assessment records created as `draft`
  2. TA previews: Lumen impact + landmark stage change preview
  3. TA publishes → atomic transaction:
     a. Assessment: draft → published
     b. LumenDelta computed per student (score% × mission max_lumens)
     c. ClassProgress.total_lumens updated
     d. LandmarkState.stage advanced if threshold crossed
     e. ShipLog entry created (bilingual narrative)
  4. ISR revalidation: harbor map, student dashboards
  Revision: new_score − old_score delta applied; audit trail kept.

## [domain.world-progression]
- **Aliases**: landmark, harbor, restoration, stage, milestone
- **Short**: Eight landmarks with configurable Lumen thresholds driving automatic stage advancement.
- **Card**:
  Thresholds configured per Course (staff-editable).
  Stages: 0=dormant, 1=under_restoration, 2=operational, 3=flourishing.
  Three distinct progress dimensions — never conflate:
    - Chapters: course teaching units (TA-controlled schedule)
    - Restoration Stages: shared harbor state (class Lumens)
    - Keeper Ranks: individual advancement (personal Lumens)
  Rank ladder: Apprentice → Beacon → Signal → Drift Navigator → Harbor Steward.

## [domain.auth]
- **Aliases**: auth, login, invite, registration, role
- **Short**: Invite-only email+password auth via Auth.js v5 credentials provider.
- **Card**:
  No public registration. TAs create Invite records per student email.
  Student follows link → sets password → account activated.
  Roles: owner (seed), staff (TAs), student.
  Extensible: GitHub OAuth or UT SSO can be added as Auth.js providers later.
  Session: JWT. No server-side session storage required for Phase 1.
