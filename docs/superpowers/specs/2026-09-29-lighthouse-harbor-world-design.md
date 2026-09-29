# The Lighthouse — Harbor World System Design

**Course:** Advanced Programming (AP), University of Tehran, CS Department  
**Domain:** `aput.ir` · **GitHub Org:** `aputir`  
**Date:** 2026-09-29 · **Author:** Design session with AI pair programmer  
**Status:** Approved — ready for implementation planning

---

## 1. Overview

The Lighthouse is a gamified course-management and progress-visualization system for an AP course at UT. Students ("Keepers") complete assignments and accumulate "Lumens." Their collective progress is reflected in a shared nautical world — the Harbor — that visually evolves as the class achieves milestones. Individual progress, crew (team) progress, and class-wide world restoration are all tracked in a single unified system.

**Phase 1 (this spec):** Full website + TA dashboard for score entry. Harbor world state is computed automatically from published scores. No code execution infrastructure.

**Phase 2 (future):** Student code submission via API/WebSocket, automated judge (DOMjudge or custom), and a live bot arena (Regatta). Phase 2 is out of scope for this document.

---

## 2. World Design

### 2.1 Theme

A lighthouse on a calm ocean of starlight — half seaside beacon, half tiny space station. Students are new Keepers who wake the lamp, guide drifting ships home, and gradually turn a sleepy outpost into a busy harbor.

### 2.2 The Eight Landmarks

Each landmark maps to a CS topic taught in the course. Each has four stages:
**Dormant → Under Restoration → Operational → Flourishing**

| # | Name | CS Topic | Mission | Lens Title |
|---|------|----------|---------|-----------|
| 1 | The Lighthouse | Classes · Encapsulation | Wake the lamp | First light |
| 2 | Arrival Docks | Inheritance · Composition | Welcome the fleet | Safe arrival |
| 3 | Signal Tower | Interfaces · Polymorphism | The signal code | Clear signal |
| 4 | Tide Observatory | Observer Pattern | Listen to the tide | Tide reader |
| 5 | Fogway Buoys | Strategy Pattern | Find a way through | Pathfinder |
| 6 | The Shipyard | Factory · Builder | Build for the voyage | Shipwright |
| 7 | Harbor Control | Command · State | Keep the harbor moving | Harbor steward |
| 8 | Relay Station | Decorator · Adapter | Reconnect the old radio | Across the drift |

### 2.3 Individual Progress — Keeper Ranks

Students advance through ranks based on their personal Lumen total:

| Rank | Name |
|------|------|
| 1 | Apprentice Keeper |
| 2 | Beacon Keeper |
| 3 | Signal Keeper |
| 4 | Drift Navigator |
| 5 | Harbor Steward |

### 2.4 Currency: Lumens

- 1 mission (assignment) completed = up to 100 Lumens (scaled by score percentage)
- Lumens are awarded per-student when TAs publish scores
- Lumens drive individual rank, crew ship upgrades, and class-wide landmark restoration
- Score states: **Draft → Published → Revised**
- A revised score recalculates Lumens, updating the delta (not re-awarding)
- Unassessed missions show "Awaiting Assessment" — never as zero

### 2.5 World Progression Rules (Automated)

When TAs publish scores, the server automatically:
1. Calculates per-student Lumen deltas
2. Updates individual rank
3. Aggregates class-wide Lumen totals per landmark
4. Advances landmark stages based on class total thresholds (configured per chapter)
5. Triggers a "Ship's Log" entry narrating the change

The TA dashboard shows a preview before publishing. TAs publish — the system computes the rest.

### 2.6 Three Distinct Progress Dimensions

To avoid confusion between levels, three terms are kept strictly separate:

| Term | Meaning |
|------|---------|
| **Chapters** | Course units (teaching schedule, TA-controlled) |
| **Restoration Stages** | Shared harbor landmark progress (class achievement) |
| **Keeper Ranks** | Individual student advancement (personal Lumens) |

---

## 3. Architecture

### 3.1 Repository Structure

```
aputir/lighthouse          ← monorepo (Turborepo)
├── apps/
│   └── web/               ← Next.js 15 (App Router, TypeScript)
│       ├── src/app/       ← App Router pages
│       │   ├── (public)/  ← Harbor map, public profiles
│       │   ├── (student)/ ← Student dashboard (auth required)
│       │   ├── (staff)/   ← TA dashboard (staff role required)
│       │   └── api/       ← API routes (server actions preferred)
│       └── src/components/
├── packages/
│   ├── db/                ← Drizzle ORM schema + migrations (shared)
│   └── ui/                ← Shared design system components (optional Phase 2)
└── apps/
    └── judge/             ← STUB only — Phase 2 code judge
```

**Single GitHub repo:** `aputir/lighthouse`

### 3.2 Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js 15 (App Router) | Server components, server actions, zero extra API layer |
| Language | TypeScript | Type safety end-to-end |
| Styling | Tailwind CSS v4 + shadcn/ui | Fast, consistent, accessible |
| ORM | Drizzle ORM | Type-safe, lightweight, pairs perfectly with Neon |
| Database | Neon (serverless Postgres) | Zero-ops, free tier, Vercel-native |
| Auth | Auth.js v5 (Credentials) | Email + password, invite-only registration |
| Deploy | Vercel | Zero-config Next.js, PR previews, free tier |
| i18n | next-intl | Persian primary (`fa`), English secondary (`en`) |
| Monorepo | Turborepo | Caching, workspace management |
| Package mgr | Bun | Fast installs, consistent with Manova stack |

### 3.3 Data Model (Core Entities)

```
Course         ← id, name, semester, slug, active
├── Chapter    ← id, course_id, title, order, opens_at, closes_at
│   └── Mission← id, chapter_id, title, description, max_lumens
├── Enrollment ← id, course_id, user_id, enrolled_at, status
└── Crew       ← id, course_id, name, ship_name

User           ← id, email, password_hash, name, student_id, role (student|staff|owner)
├── Invite     ← id, email, created_by, token, used_at

Assessment     ← id, mission_id, user_id, lumens, raw_score, state (draft|published|revised)
               ← published_by, published_at, revision_reason, revised_at, revised_by

LandmarkState  ← id, course_id, landmark_index, stage (0-3), updated_at
ClassProgress  ← id, course_id, total_lumens, computed_at

ShipLog        ← id, course_id, body_fa, body_en, triggered_at, landmark_index
```

### 3.4 Role Model

| Role | Access |
|------|--------|
| `owner` | Everything. Seed only — the head TA / course admin |
| `staff` | TA dashboard: score entry, publish, course/chapter/mission management, roster |
| `student` | Own progress view, crew view, harbor map (read-only world state) |
| `public` | Harbor map (public world state), leaderboard (if enabled), no scores |

Role is a DB field on `User`. TAs are provisioned manually (owner sets role in admin).

### 3.5 Authentication Flow

1. **No public registration.** Invite-only.
2. Owner/staff creates an `Invite` record with the student's email.
3. Student receives a link (or the TA sends it manually) → sets password → account activated.
4. Login: email + password → Auth.js credentials provider → JWT session.
5. Future: pluggable provider (GitHub, UT SSO) via Auth.js without changing the rest of the system.

---

## 4. Views & User Flows

### 4.1 Public Views (no auth)

- **`/`** — Harbor Map: animated/illustrated world showing all 8 landmarks with their current stage. Ship's Log preview. No scores shown.
- **`/leaderboard`** — Optional public leaderboard (toggle in course settings)
- **`/login`** — Email + password login

### 4.2 Student Views (auth required)

- **`/dashboard`** — Personal: Keeper rank, Lumen total, mission progress, next mission
- **`/missions`** — All chapters and missions with assessment status (Awaiting / score)
- **`/crew`** — Crew members, crew ship name, crew Lumen total
- **`/harbor`** — Full harbor map (same as public but with personalized overlays)
- **`/profile`** — Personal profile (public link if leaderboard is on)

### 4.3 TA (Staff) Views (staff role required)

- **`/staff`** — Dashboard overview: course health, recent publishes, outstanding drafts
- **`/staff/roster`** — Student list, invite management, enrollment status
- **`/staff/missions`** — Chapters + missions management (create, edit, set schedule)
- **`/staff/grades`** — Score grid: one assignment → all students, keyboard-nav, bulk import (CSV)
- **`/staff/grades/[mission]`** — Per-mission grading view with draft/publish/revise controls
- **`/staff/world`** — World state preview (shows what harbor looks like now and after next publish)
- **`/staff/crews`** — Crew management
- **`/staff/logs`** — Ship's Log history

---

## 5. Score Entry & World Computation

### 5.1 TA Score Workflow

```
Draft entry (keyboard nav grid)
  → Preview: "Publishing will award 2,340 Lumens to 18 students"
  → Preview: "Harbor impact: Signal Tower advances to Operational"
  → Confirm Publish
    → Atomic DB transaction:
       1. Assessment records: draft → published
       2. Lumen delta computation per student
       3. ClassProgress aggregation
       4. LandmarkState update (threshold check)
       5. ShipLog entry creation
    → Revalidate: harbor map, student dashboards
```

### 5.2 Landmark Stage Thresholds

Thresholds are configured per course (staff-editable). Example:

| Stage | Class Lumens Required |
|-------|-----------------------|
| Dormant → Under Restoration | 500 |
| Under Restoration → Operational | 1,500 |
| Operational → Flourishing | 3,000 |

Thresholds are per-landmark and represent cumulative class Lumens assigned to that chapter.

### 5.3 Score Revision

- Revising a published score requires: revised score, reason, and author
- Delta Lumens computed: new − old (can be negative)
- All revision history kept (full audit trail)
- Ship's Log updated if a landmark stage changes due to revision

---

## 6. Internationalization

- **Primary locale: `fa`** (Persian, RTL)
- **Secondary locale: `en`** (English, LTR)
- World lore (landmark names, Ship's Log narratives) bilingual
- UI chrome: all labels have both translations
- Persian numerals for display in `fa` locale
- next-intl handles locale detection and routing (`/fa/...`, `/en/...` or cookie-based)

---

## 7. What's Explicitly Out of Phase 1

- Code submission, execution, automated judging
- Bot arenas (Regatta)
- GitHub OAuth (can be added later via Auth.js provider)
- UT SSO (requires institutional approval)
- Real-time WebSocket updates (polling or ISR sufficient for Phase 1)
- Mobile app

---

## 8. Agent & Documentation Conventions (Manova-style)

### 8.1 Repository Root Files

```
lighthouse/
├── AGENTS.md              ← Agent routing, context budget, delivery rules
├── WORKSPACE_INDEX.md     ← Multi-resolution index of all packages/apps
├── GEMINI.md              ← (optional) Agent-specific rules
├── docs/
│   ├── superpowers/
│   │   └── specs/         ← Design docs (this file lives here)
│   ├── decisions/         ← ADRs: ADR-001-monorepo, ADR-002-auth, etc.
│   └── guides/
│       ├── delivery.md    ← Branch workflow, commit conventions
│       └── agent-routing.yaml ← Path-based context routing for agents
└── .cursor/ (or .agents/)
    └── agents/
        └── worker.md      ← Subagent execution spec
```

### 8.2 Delivery Rules (from Manova ADR-026)

- No direct push to `main` — branch-first workflow
- Conventional Commits: `feat:`, `fix:`, `refactor:`
- PR-only merges
- Biome for linting/formatting (replaces ESLint + Prettier)

### 8.3 Subagent Tiering

| Tier | Task Type | Model |
|------|-----------|-------|
| Scout | File search, grep, schema read | `flash` |
| Implementer | Multi-file feature, DB migrations | `inherit`/`pro` |

### 8.4 Tech Quality Gates

- `bun run typecheck` — must pass before PR
- `bun run lint` (Biome) — must pass
- `bun test` — unit tests for progression computation logic
- No raw `process.env` in components — use typed config module

---

## 9. Open Questions (Deferred)

| # | Question | Priority |
|---|----------|----------|
| 1 | How many students are enrolled? (affects Lumen threshold tuning) | Low |
| 2 | Will the harbor map be SVG-illustrated or CSS/canvas? | Before UI implementation |
| 3 | Is Ship's Log content auto-generated (AI) or TA-written templates? | Low |
| 4 | Semester archive strategy (copy course structure for next year)? | Phase 2 |
| 5 | Will Phase 2 judge be DOMjudge integration or custom? | Phase 2 |

---

## 10. Success Criteria for Phase 1

- [ ] TAs can create a course, add chapters + missions, manage roster
- [ ] TAs can enter scores in a grid, preview world impact, and publish
- [ ] Published scores automatically compute Lumens and advance landmark stages
- [ ] Students see their personal progress, crew status, and the harbor map
- [ ] Harbor map reflects real class achievement
- [ ] Ship's Log narrates milestone events
- [ ] Full auth: invite-only email+password, staff role gating
- [ ] Deployed at `aput.ir` via Vercel + Neon
- [ ] Persian-primary UI with English fallback
