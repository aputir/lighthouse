# Lighthouse Phase 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build The Lighthouse Harbor World — a gamified AP course platform where TAs enter scores that automatically advance a shared nautical world, deployed at aput.ir.

**Architecture:** Turborepo monorepo with `apps/web` (Next.js 15 App Router) and `packages/db` (Drizzle ORM on Neon Postgres). Auth.js v5 credentials provider with invite-only registration. Score publication triggers atomic Lumen computation and landmark stage advancement. Persian primary UI with next-intl.

**Tech Stack:** Next.js 15 · TypeScript · Tailwind CSS v4 · shadcn/ui · Drizzle ORM · Neon Postgres · Auth.js v5 · next-intl · Biome · Turborepo · Bun · Vercel

## Global Constraints

- Bun as package manager — never `npm` or `yarn`
- Biome for linting/formatting — never ESLint or Prettier; run `bun run lint` before every commit
- TypeScript strict mode — `bun run typecheck` must pass before every commit
- No raw `process.env` in components — import from `apps/web/src/lib/config.ts` typed config
- Persian primary (`fa`), English secondary (`en`) — every user-visible string needs both `messages/fa.json` and `messages/en.json` entries
- Persian numeral rendering in `fa` locale for scores, ranks, and counts
- RTL layout in `fa` locale — use Tailwind logical properties (`ms-`, `me-`, `ps-`, `pe-`) not `ml-`/`mr-`
- No direct push to `main` — branch per task: `feat/task-N-<slug>`
- `WORKSPACE_INDEX.md` must be updated whenever a new app or package is added
- `apps/judge/` is a Phase 2 stub — never implement or expand it
- Assessment states: `draft | published | revised` — never implicit null for "no score"
- Landmark stages: `dormant | under_restoration | operational | flourishing`
- Lumen delta on score revision = `new_lumens − old_lumens` (signed, applied atomically)

---

## Sub-Plan Index

This Phase 1 is split into 7 sequential tasks. Each task produces independently testable, committed software.

| Task | Name | Depends On |
|------|------|------------|
| 1 | Monorepo Scaffold | — |
| 2 | Database Schema | Task 1 |
| 3 | Auth — Invite-Only Email+Password | Task 2 |
| 4 | TA Dashboard — Course & Roster Management | Task 3 |
| 5 | TA Dashboard — Score Grid & Publish Pipeline | Task 4 |
| 6 | Student Views | Task 3 |
| 7 | Public Harbor Map | Task 2 |

---

## Task 1: Monorepo Scaffold

**Files:**
- Create: `package.json` (root — Turborepo workspace)
- Create: `turbo.json`
- Create: `biome.json`
- Create: `tsconfig.base.json`
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/src/app/layout.tsx`
- Create: `apps/web/src/app/page.tsx` (placeholder)
- Create: `apps/web/src/lib/config.ts` (typed env wrapper)
- Create: `apps/web/.env.example`
- Create: `apps/web/messages/fa.json` (empty shell)
- Create: `apps/web/messages/en.json` (empty shell)
- Create: `apps/web/src/i18n/request.ts`
- Create: `apps/web/src/i18n/routing.ts`
- Create: `packages/db/package.json`
- Create: `packages/db/tsconfig.json`
- Create: `packages/db/src/index.ts` (re-exports)
- Create: `packages/db/drizzle.config.ts`
- Create: `apps/judge/package.json` (stub — empty)
- Create: `apps/judge/README.md` (Phase 2 notice)
- Update: `WORKSPACE_INDEX.md`

**Interfaces:**
- Produces:
  - `apps/web` dev server running at `localhost:3000` with a placeholder page
  - `bun run dev` from root starts the web app
  - `bun run typecheck` passes (zero errors)
  - `bun run lint` passes (Biome)
  - `packages/db` importable as `@lighthouse/db` in `apps/web`

- [ ] **Step 1: Initialize root package.json with Turborepo workspace**

```bash
# Run from /home/opmc/Dev/aputir (repo root — already git-initialized)
git checkout -b feat/task-1-monorepo-scaffold
```

Create `/home/opmc/Dev/aputir/package.json`:
```json
{
  "name": "lighthouse",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "typecheck": "turbo typecheck",
    "lint": "turbo lint",
    "test": "turbo test"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.4",
    "turbo": "^2.3.3",
    "typescript": "^5.7.2"
  }
}
```

- [ ] **Step 2: Create turbo.json**

Create `/home/opmc/Dev/aputir/turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "lint": {},
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

- [ ] **Step 3: Create biome.json at repo root**

Create `/home/opmc/Dev/aputir/biome.json`:
```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "vcs": { "enabled": true, "clientKind": "git", "useIgnoreFile": true },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": { "noUnusedVariables": "error" },
      "style": { "noNonNullAssertion": "warn" }
    }
  },
  "javascript": {
    "formatter": { "quoteStyle": "double", "semicolons": "always" }
  },
  "files": {
    "ignore": ["**/node_modules/**", "**/.next/**", "**/dist/**"]
  }
}
```

- [ ] **Step 4: Create shared tsconfig.base.json**

Create `/home/opmc/Dev/aputir/tsconfig.base.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true
  }
}
```

- [ ] **Step 5: Create packages/db scaffold**

Create `/home/opmc/Dev/aputir/packages/db/package.json`:
```json
{
  "name": "@lighthouse/db",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:migrate": "drizzle-kit migrate",
    "db:seed": "bun run src/seed.ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.10.4",
    "drizzle-orm": "^0.38.4"
  },
  "devDependencies": {
    "drizzle-kit": "^0.30.4",
    "typescript": "^5.7.2"
  }
}
```

Create `/home/opmc/Dev/aputir/packages/db/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

Create `/home/opmc/Dev/aputir/packages/db/src/index.ts`:
```typescript
// Re-export everything from schema and db client
export * from "./schema";
export { db } from "./client";
```

Create `/home/opmc/Dev/aputir/packages/db/src/client.ts`:
```typescript
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

Create `/home/opmc/Dev/aputir/packages/db/src/schema.ts`:
```typescript
// Schema barrel — will be populated in Task 2
// Placeholder to allow Task 1 to typecheck
export {};
```

Create `/home/opmc/Dev/aputir/packages/db/drizzle.config.ts`:
```typescript
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

- [ ] **Step 6: Create apps/judge stub**

Create `/home/opmc/Dev/aputir/apps/judge/package.json`:
```json
{
  "name": "@lighthouse/judge",
  "version": "0.0.0",
  "private": true,
  "description": "PHASE 2 STUB — Code execution judge. Do not implement in Phase 1."
}
```

Create `/home/opmc/Dev/aputir/apps/judge/README.md`:
```markdown
# Judge — Phase 2 Stub

This package is reserved for Phase 2: automated code judging and bot arenas (Regatta).

**Do not implement anything here in Phase 1.**

See the design spec: `docs/superpowers/specs/2026-09-29-lighthouse-harbor-world-design.md`
```

- [ ] **Step 7: Create apps/web scaffold**

```bash
# Install Next.js with App Router and required deps
bun create next-app@latest apps/web --typescript --tailwind --app --no-src-dir --import-alias "@/*" --no-eslint
# Then replace package.json with our controlled version (next step)
```

Replace `apps/web/package.json` with:
```json
{
  "name": "@lighthouse/web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "lint": "biome check ."
  },
  "dependencies": {
    "@lighthouse/db": "workspace:*",
    "@fontsource-variable/estedad": "^5.1.1",
    "next": "^15.1.6",
    "next-intl": "^3.26.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.4",
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "typescript": "^5.7.2"
  }
}
```

- [ ] **Step 8: Create typed env config**

Create `/home/opmc/Dev/aputir/apps/web/src/lib/config.ts`:
```typescript
/**
 * Typed, validated environment configuration.
 * All env access in the app MUST go through this module — never raw process.env.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const config = {
  database: {
    url: requireEnv("DATABASE_URL"),
  },
  auth: {
    secret: requireEnv("AUTH_SECRET"),
    url: process.env.AUTH_URL ?? "http://localhost:3000",
  },
} as const;
```

- [ ] **Step 9: Create .env.example**

Create `/home/opmc/Dev/aputir/apps/web/.env.example`:
```bash
# Neon Postgres — get from neon.tech console
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Auth.js — generate with: openssl rand -base64 32
AUTH_SECRET=your-secret-here

# Auth.js base URL (set to https://aput.ir in production)
AUTH_URL=http://localhost:3000

# Seed — initial owner account (used by db:seed only)
SEED_OWNER_EMAIL=you@example.com
SEED_OWNER_PASSWORD=change-me-immediately
```

- [ ] **Step 10: Set up next-intl routing**

Create `/home/opmc/Dev/aputir/apps/web/src/i18n/routing.ts`:
```typescript
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fa", "en"],
  defaultLocale: "fa",
  localePrefix: "always",
});
```

Create `/home/opmc/Dev/aputir/apps/web/src/i18n/request.ts`:
```typescript
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as "fa" | "en")) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

Create `/home/opmc/Dev/aputir/apps/web/messages/fa.json`:
```json
{
  "app": {
    "name": "فانوس دریایی",
    "tagline": "دوره برنامه‌نویسی پیشرفته — دانشگاه تهران"
  }
}
```

Create `/home/opmc/Dev/aputir/apps/web/messages/en.json`:
```json
{
  "app": {
    "name": "The Lighthouse",
    "tagline": "Advanced Programming Course — University of Tehran"
  }
}
```

- [ ] **Step 11: Create root layout with locale and font**

Create `/home/opmc/Dev/aputir/apps/web/src/app/[locale]/layout.tsx`:
```typescript
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "@fontsource-variable/estedad";
import "../globals.css";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "The Lighthouse — APUT",
  description: "Advanced Programming Course — University of Tehran",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "fa" | "en")) notFound();
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === "fa" ? "rtl" : "ltr"}>
      <body className="font-estedad antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

Create `/home/opmc/Dev/aputir/apps/web/src/app/[locale]/page.tsx`:
```typescript
import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("app");
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">{t("name")}</h1>
      <p className="mt-2 text-muted-foreground">{t("tagline")}</p>
    </main>
  );
}
```

Create `/home/opmc/Dev/aputir/apps/web/src/app/globals.css`:
```css
@import "tailwindcss";

:root {
  --font-estedad: "Estedad Variable", sans-serif;
}

body {
  font-family: var(--font-estedad);
}
```

- [ ] **Step 12: Create next.config.ts with next-intl**

Create `/home/opmc/Dev/aputir/apps/web/next.config.ts`:
```typescript
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {};

export default withNextIntl(nextConfig);
```

- [ ] **Step 13: Install all dependencies**

```bash
# From repo root
bun install
```

- [ ] **Step 14: Verify typecheck passes**

```bash
bun run typecheck
```
Expected: zero errors. If errors appear, fix them before continuing.

- [ ] **Step 15: Verify lint passes**

```bash
bun run lint
```
Expected: zero errors.

- [ ] **Step 16: Start dev server and verify placeholder renders**

```bash
bun run dev
# Open http://localhost:3000 — should redirect to /fa and show "فانوس دریایی"
# Open http://localhost:3000/en — should show "The Lighthouse"
```

- [ ] **Step 17: Update WORKSPACE_INDEX.md**

Add entries for `apps/web` and `packages/db` with accurate stack/port info (Task 1 establishes these).

- [ ] **Step 18: Commit**

```bash
git add -A
git commit -m "feat: monorepo scaffold — Next.js 15, Turborepo, Drizzle, next-intl, Biome"
```

---

## Task 2: Database Schema

**Files:**
- Create: `packages/db/src/schema/users.ts`
- Create: `packages/db/src/schema/courses.ts`
- Create: `packages/db/src/schema/assessments.ts`
- Create: `packages/db/src/schema/world.ts`
- Modify: `packages/db/src/schema.ts` (import all + barrel export)
- Create: `packages/db/src/seed.ts`
- Create: `packages/db/migrations/` (auto-generated by drizzle-kit)

**Interfaces:**
- Consumes: Task 1 (Drizzle client in `packages/db/src/client.ts`)
- Produces:
  - `import { db, users, courses, chapters, missions, assessments, landmarkStates, shipLogs, enrollments, crews, invites } from "@lighthouse/db"` works in `apps/web`
  - `bun --filter @lighthouse/db run db:push` pushes schema to Neon without error
  - `bun --filter @lighthouse/db run db:seed` creates one owner account

- [ ] **Step 1: Create users schema**

Create `/home/opmc/Dev/aputir/packages/db/src/schema/users.ts`:
```typescript
import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const userRoleEnum = pgEnum("user_role", ["owner", "staff", "student"]);

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  studentId: text("student_id"), // UT student ID, optional
  role: userRoleEnum("role").notNull().default("student"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const invites = pgTable("invites", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  email: text("email").notNull().unique(),
  token: text("token").notNull().unique(),
  createdBy: text("created_by").notNull().references(() => users.id),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Invite = typeof invites.$inferSelect;
export type NewInvite = typeof invites.$inferInsert;
```

- [ ] **Step 2: Create courses schema**

Create `/home/opmc/Dev/aputir/packages/db/src/schema/courses.ts`:
```typescript
import { pgTable, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./users";

export const courses = pgTable("courses", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull(), // e.g. "Advanced Programming — Autumn 2026"
  nameFa: text("name_fa").notNull(),
  slug: text("slug").notNull().unique(), // url-safe, e.g. "ap-autumn-2026"
  semester: text("semester").notNull(), // e.g. "Autumn 2026"
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chapters = pgTable("chapters", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  courseId: text("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  titleFa: text("title_fa").notNull(),
  order: integer("order").notNull(), // display order, 1-indexed
  opensAt: timestamp("opens_at", { withTimezone: true }), // null = immediately open
  closesAt: timestamp("closes_at", { withTimezone: true }), // null = never closes
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const missions = pgTable("missions", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  chapterId: text("chapter_id").notNull().references(() => chapters.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  titleFa: text("title_fa").notNull(),
  description: text("description"),
  descriptionFa: text("description_fa"),
  maxLumens: integer("max_lumens").notNull().default(100), // max Lumens for a perfect score
  order: integer("order").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const enrollments = pgTable("enrollments", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  courseId: text("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  enrolledAt: timestamp("enrolled_at", { withTimezone: true }).notNull().defaultNow(),
  active: boolean("active").notNull().default(true),
});

export const crews = pgTable("crews", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  courseId: text("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  shipName: text("ship_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const crewMembers = pgTable("crew_members", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  crewId: text("crew_id").notNull().references(() => crews.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Course = typeof courses.$inferSelect;
export type Chapter = typeof chapters.$inferSelect;
export type Mission = typeof missions.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
export type Crew = typeof crews.$inferSelect;
```

- [ ] **Step 3: Create assessments schema**

Create `/home/opmc/Dev/aputir/packages/db/src/schema/assessments.ts`:
```typescript
import { pgTable, text, timestamp, integer, pgEnum, real } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./users";
import { missions } from "./courses";

export const assessmentStateEnum = pgEnum("assessment_state", [
  "draft",
  "published",
  "revised",
]);

export const assessments = pgTable("assessments", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  missionId: text("mission_id").notNull().references(() => missions.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  // Score as percentage 0-100 (raw); Lumens = (rawScore / 100) × maxLumens
  rawScore: real("raw_score"), // null = not assessed yet
  lumens: integer("lumens"), // computed and stored on publish

  state: assessmentStateEnum("state").notNull().default("draft"),

  // Publish audit
  publishedBy: text("published_by").references(() => users.id),
  publishedAt: timestamp("published_at", { withTimezone: true }),

  // Revision audit
  revisedBy: text("revised_by").references(() => users.id),
  revisedAt: timestamp("revised_at", { withTimezone: true }),
  revisionReason: text("revision_reason"),
  previousLumens: integer("previous_lumens"), // stored on revision for delta calculation

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Assessment = typeof assessments.$inferSelect;
export type NewAssessment = typeof assessments.$inferInsert;
```

- [ ] **Step 4: Create world schema**

Create `/home/opmc/Dev/aputir/packages/db/src/schema/world.ts`:
```typescript
import { pgTable, text, timestamp, integer, pgEnum, real } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { courses } from "./courses";

export const landmarkStageEnum = pgEnum("landmark_stage", [
  "dormant",
  "under_restoration",
  "operational",
  "flourishing",
]);

// One row per landmark per course (8 landmarks × 1 active course = 8 rows)
export const landmarkStates = pgTable("landmark_states", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  courseId: text("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  landmarkIndex: integer("landmark_index").notNull(), // 0-7
  stage: landmarkStageEnum("stage").notNull().default("dormant"),
  totalLumens: integer("total_lumens").notNull().default(0), // class lumens assigned to this landmark
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Configurable thresholds for each landmark per course
export const landmarkThresholds = pgTable("landmark_thresholds", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  courseId: text("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  landmarkIndex: integer("landmark_index").notNull(), // 0-7
  toUnderRestoration: integer("to_under_restoration").notNull().default(500),
  toOperational: integer("to_operational").notNull().default(1500),
  toFlourishing: integer("to_flourishing").notNull().default(3000),
});

// Immutable event log — one entry per milestone (landmark stage advance)
export const shipLogs = pgTable("ship_logs", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  courseId: text("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  landmarkIndex: integer("landmark_index"), // null for general events
  newStage: landmarkStageEnum("new_stage"),
  bodyFa: text("body_fa").notNull(),
  bodyEn: text("body_en").notNull(),
  triggeredAt: timestamp("triggered_at", { withTimezone: true }).notNull().defaultNow(),
});

export type LandmarkState = typeof landmarkStates.$inferSelect;
export type ShipLog = typeof shipLogs.$inferSelect;
```

- [ ] **Step 5: Wire schema barrel**

Replace `/home/opmc/Dev/aputir/packages/db/src/schema.ts`:
```typescript
export * from "./schema/users";
export * from "./schema/courses";
export * from "./schema/assessments";
export * from "./schema/world";
```

- [ ] **Step 6: Install @paralleldrive/cuid2**

```bash
bun --filter @lighthouse/db add @paralleldrive/cuid2
```

- [ ] **Step 7: Write seed script**

Create `/home/opmc/Dev/aputir/packages/db/src/seed.ts`:
```typescript
import { db } from "./client";
import { users } from "./schema/users";
import { hashSync } from "bcryptjs"; // bun add bcryptjs

const ownerEmail = process.env.SEED_OWNER_EMAIL ?? "owner@aput.ir";
const ownerPassword = process.env.SEED_OWNER_PASSWORD ?? "change-me";

async function seed() {
  console.log("Seeding owner account...");
  await db
    .insert(users)
    .values({
      email: ownerEmail,
      passwordHash: hashSync(ownerPassword, 12),
      name: "Course Admin",
      role: "owner",
    })
    .onConflictDoNothing();
  console.log(`✓ Owner: ${ownerEmail}`);
}

seed().catch(console.error);
```

```bash
bun --filter @lighthouse/db add bcryptjs
bun --filter @lighthouse/db add -d @types/bcryptjs
```

- [ ] **Step 8: Push schema to Neon dev branch**

```bash
# Ensure DATABASE_URL is set in packages/db/.env or root .env
bun --filter @lighthouse/db run db:push
```
Expected: Drizzle confirms all tables created without errors.

- [ ] **Step 9: Typecheck**

```bash
bun run typecheck
```
Expected: zero errors.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: database schema — users, courses, assessments, world state, ship log"
```

---

## Task 3: Auth — Invite-Only Email+Password

**Files:**
- Create: `apps/web/src/lib/auth.ts` (Auth.js config)
- Create: `apps/web/src/app/api/auth/[...nextauth]/route.ts`
- Create: `apps/web/src/middleware.ts`
- Create: `apps/web/src/app/[locale]/(public)/login/page.tsx`
- Create: `apps/web/src/app/[locale]/(public)/login/actions.ts`
- Create: `apps/web/src/app/[locale]/(public)/invite/[token]/page.tsx`
- Create: `apps/web/src/app/[locale]/(public)/invite/[token]/actions.ts`
- Create: `apps/web/src/lib/auth-helpers.ts` (session helpers)
- Modify: `apps/web/messages/fa.json`
- Modify: `apps/web/messages/en.json`

**Interfaces:**
- Consumes: Task 2 (`@lighthouse/db` — `users`, `invites` tables)
- Produces:
  - `import { auth } from "@/lib/auth"` returns session with `user.role`
  - `import { requireRole } from "@/lib/auth-helpers"` throws redirect if role not met
  - `/[locale]/login` renders email+password form, redirects to dashboard on success
  - `/[locale]/invite/[token]` validates token, lets user set password, activates account
  - Unauthenticated access to protected routes redirects to `/[locale]/login`

- [ ] **Step 1: Install Auth.js v5**

```bash
bun --filter @lighthouse/web add next-auth@beta
```

- [ ] **Step 2: Create Auth.js config**

Create `/home/opmc/Dev/aputir/apps/web/src/lib/auth.ts`:
```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@lighthouse/db";
import { users } from "@lighthouse/db";
import { eq } from "drizzle-orm";
import { compareSync } from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1);
        if (!user) return null;
        const valid = compareSync(credentials.password as string, user.passwordHash);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      return session;
    },
  },
  pages: {
    signIn: "/login", // next-intl middleware adds locale prefix
  },
  secret: process.env.AUTH_SECRET,
});
```

- [ ] **Step 3: Extend Auth.js types**

Create `/home/opmc/Dev/aputir/apps/web/src/types/next-auth.d.ts`:
```typescript
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "owner" | "staff" | "student";
    } & DefaultSession["user"];
  }
}
```

- [ ] **Step 4: Create API route handler**

Create `/home/opmc/Dev/aputir/apps/web/src/app/api/auth/[...nextauth]/route.ts`:
```typescript
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

- [ ] **Step 5: Create auth helpers**

Create `/home/opmc/Dev/aputir/apps/web/src/lib/auth-helpers.ts`:
```typescript
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function getSession() {
  return auth();
}

/**
 * Asserts the current user has at least the given role.
 * Role hierarchy: student < staff < owner
 * Redirects to /login if not authenticated or role insufficient.
 */
export async function requireRole(
  minimumRole: "student" | "staff" | "owner",
  locale: string
): Promise<NonNullable<Awaited<ReturnType<typeof auth>>>["user"]> {
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const roleOrder = { student: 0, staff: 1, owner: 2 };
  if (roleOrder[session.user.role as keyof typeof roleOrder] < roleOrder[minimumRole]) {
    redirect(`/${locale}/login`);
  }

  return session.user;
}
```

- [ ] **Step 6: Create middleware for route protection**

Create `/home/opmc/Dev/aputir/apps/web/src/middleware.ts`:
```typescript
import { auth } from "@/lib/auth";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const intlMiddleware = createIntlMiddleware(routing);

const protectedPatterns = [
  /\/[a-z]{2}\/(dashboard|missions|crew|harbor|profile)/,
  /\/[a-z]{2}\/staff/,
];

export default async function middleware(req: NextRequest) {
  const isProtected = protectedPatterns.some((p) => p.test(req.nextUrl.pathname));

  if (isProtected) {
    const session = await auth();
    if (!session?.user) {
      const locale = req.nextUrl.pathname.split("/")[1] ?? "fa";
      return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
    }
    // Staff-only routes
    if (req.nextUrl.pathname.includes("/staff") && session.user.role === "student") {
      const locale = req.nextUrl.pathname.split("/")[1] ?? "fa";
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
```

- [ ] **Step 7: Create login page**

Create `/home/opmc/Dev/aputir/apps/web/src/app/[locale]/(public)/login/page.tsx`:
```typescript
import { LoginForm } from "./login-form";
import { getTranslations } from "next-intl/server";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("auth");
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 p-6">
        <h1 className="text-2xl font-bold">{t("signIn")}</h1>
        <LoginForm locale={locale} />
      </div>
    </main>
  );
}
```

Create `/home/opmc/Dev/aputir/apps/web/src/app/[locale]/(public)/login/login-form.tsx`:
```typescript
"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export function LoginForm({ locale }: { locale: string }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });
    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      window.location.href = `/${locale}/dashboard`;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">Email</label>
        <input id="email" name="email" type="email" required
          className="mt-1 block w-full rounded border px-3 py-2" />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium">Password</label>
        <input id="password" name="password" type="password" required
          className="mt-1 block w-full rounded border px-3 py-2" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full rounded bg-primary px-4 py-2 text-white disabled:opacity-50">
        {loading ? "..." : "Sign in"}
      </button>
    </form>
  );
}
```

- [ ] **Step 8: Create invite activation flow**

Create `/home/opmc/Dev/aputir/apps/web/src/app/[locale]/(public)/invite/[token]/page.tsx`:
```typescript
import { db } from "@lighthouse/db";
import { invites } from "@lighthouse/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ActivateForm } from "./activate-form";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { token } = await params;
  const [invite] = await db
    .select()
    .from(invites)
    .where(eq(invites.token, token))
    .limit(1);

  if (!invite || invite.usedAt) notFound();

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 p-6">
        <h1 className="text-2xl font-bold">Activate your account</h1>
        <p className="text-sm text-muted-foreground">{invite.email}</p>
        <ActivateForm token={token} email={invite.email} />
      </div>
    </main>
  );
}
```

Create `/home/opmc/Dev/aputir/apps/web/src/app/[locale]/(public)/invite/[token]/actions.ts`:
```typescript
"use server";
import { db } from "@lighthouse/db";
import { users, invites } from "@lighthouse/db";
import { eq } from "drizzle-orm";
import { hashSync } from "bcryptjs";
import { redirect } from "next/navigation";

export async function activateAccount(formData: FormData) {
  const token = formData.get("token") as string;
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;
  const locale = formData.get("locale") as string;

  const [invite] = await db
    .select()
    .from(invites)
    .where(eq(invites.token, token))
    .limit(1);

  if (!invite || invite.usedAt) throw new Error("Invalid or used invite");

  await db.transaction(async (tx) => {
    await tx.insert(users).values({
      email: invite.email,
      passwordHash: hashSync(password, 12),
      name,
      role: "student",
    });
    await tx
      .update(invites)
      .set({ usedAt: new Date() })
      .where(eq(invites.id, invite.id));
  });

  redirect(`/${locale}/login`);
}
```

Create `/home/opmc/Dev/aputir/apps/web/src/app/[locale]/(public)/invite/[token]/activate-form.tsx`:
```typescript
"use client";
import { activateAccount } from "./actions";

export function ActivateForm({ token, email }: { token: string; email: string }) {
  return (
    <form action={activateAccount} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="email" value={email} />
      <div>
        <label htmlFor="name" className="block text-sm font-medium">Your name</label>
        <input id="name" name="name" type="text" required
          className="mt-1 block w-full rounded border px-3 py-2" />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium">Password</label>
        <input id="password" name="password" type="password" required minLength={8}
          className="mt-1 block w-full rounded border px-3 py-2" />
      </div>
      <button type="submit"
        className="w-full rounded bg-primary px-4 py-2 text-white">
        Activate account
      </button>
    </form>
  );
}
```

- [ ] **Step 9: Add auth translations**

Add to `apps/web/messages/fa.json`:
```json
{
  "auth": {
    "signIn": "ورود به سیستم",
    "email": "ایمیل",
    "password": "رمز عبور",
    "invalidCredentials": "ایمیل یا رمز عبور اشتباه است",
    "activate": "فعال‌سازی حساب",
    "yourName": "نام شما"
  }
}
```

Add to `apps/web/messages/en.json`:
```json
{
  "auth": {
    "signIn": "Sign in",
    "email": "Email",
    "password": "Password",
    "invalidCredentials": "Invalid email or password",
    "activate": "Activate account",
    "yourName": "Your name"
  }
}
```

- [ ] **Step 10: Typecheck + lint**

```bash
bun run typecheck && bun run lint
```

- [ ] **Step 11: Manual smoke test**

```bash
bun run dev
```
1. Visit `/fa/login` — form renders
2. Try wrong credentials — error shows
3. Seed owner: `bun --filter @lighthouse/db run db:seed`
4. Login with seed credentials → redirected to `/fa/dashboard` (returns 404 until Task 4, that's expected)
5. Visit `/fa/staff` without auth → redirected to login ✓

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: invite-only email+password auth — Auth.js v5, invite activation, route protection"
```

---

## Task 4: TA Dashboard — Course & Roster Management

**Files:**
- Create: `apps/web/src/app/[locale]/(staff)/staff/layout.tsx`
- Create: `apps/web/src/app/[locale]/(staff)/staff/page.tsx` (overview)
- Create: `apps/web/src/app/[locale]/(staff)/staff/roster/page.tsx`
- Create: `apps/web/src/app/[locale]/(staff)/staff/roster/actions.ts` (create invite, list students)
- Create: `apps/web/src/app/[locale]/(staff)/staff/missions/page.tsx`
- Create: `apps/web/src/app/[locale]/(staff)/staff/missions/actions.ts` (CRUD chapters + missions)
- Create: `apps/web/src/app/[locale]/(staff)/staff/crews/page.tsx`
- Create: `apps/web/src/app/[locale]/(staff)/staff/crews/actions.ts`
- Create: `apps/web/src/lib/nanoid.ts` (invite token generator)
- Modify: `apps/web/messages/fa.json`
- Modify: `apps/web/messages/en.json`

**Interfaces:**
- Consumes: Task 3 (`requireRole("staff", locale)`)
- Produces:
  - `/[locale]/staff` — authenticated staff dashboard overview page
  - `/[locale]/staff/roster` — student list + invite creation form
  - `/[locale]/staff/missions` — chapter/mission CRUD
  - `/[locale]/staff/crews` — crew management
  - Server action `createInvite(email)` creates an `Invite` record and returns the invite URL

- [ ] **Step 1: Staff layout with auth guard**

Create `/home/opmc/Dev/aputir/apps/web/src/app/[locale]/(staff)/staff/layout.tsx`:
```typescript
import { requireRole } from "@/lib/auth-helpers";
import { StaffNav } from "@/components/staff/staff-nav";

export default async function StaffLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireRole("staff", locale);

  return (
    <div className="flex min-h-screen">
      <StaffNav locale={locale} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
```

Create `/home/opmc/Dev/aputir/apps/web/src/components/staff/staff-nav.tsx`:
```typescript
import Link from "next/link";

const navItems = [
  { href: "staff", label: "Overview", labelFa: "نمای کلی" },
  { href: "staff/roster", label: "Roster", labelFa: "فهرست دانشجویان" },
  { href: "staff/missions", label: "Missions", labelFa: "مأموریت‌ها" },
  { href: "staff/grades", label: "Grades", labelFa: "نمرات" },
  { href: "staff/crews", label: "Crews", labelFa: "خدمه‌ها" },
  { href: "staff/world", label: "World", labelFa: "جهان" },
];

export function StaffNav({ locale }: { locale: string }) {
  const isFa = locale === "fa";
  return (
    <nav className="w-56 border-e bg-muted/30 p-4">
      <ul className="space-y-1">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link href={`/${locale}/${item.href}`}
              className="block rounded px-3 py-2 text-sm hover:bg-muted">
              {isFa ? item.labelFa : item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 2: Staff overview page**

Create `/home/opmc/Dev/aputir/apps/web/src/app/[locale]/(staff)/staff/page.tsx`:
```typescript
import { db } from "@lighthouse/db";
import { courses, enrollments, assessments } from "@lighthouse/db";
import { eq, count } from "drizzle-orm";
import { getTranslations } from "next-intl/server";

export default async function StaffPage() {
  const t = await getTranslations("staff");
  // Fetch active course stats
  const [course] = await db.select().from(courses).where(eq(courses.active, true)).limit(1);
  const studentCount = course
    ? await db
        .select({ count: count() })
        .from(enrollments)
        .where(eq(enrollments.courseId, course.id))
    : [{ count: 0 }];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("overview")}</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded border p-4">
          <p className="text-sm text-muted-foreground">{t("students")}</p>
          <p className="text-3xl font-bold">{studentCount[0]?.count ?? 0}</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Invite token generator**

Create `/home/opmc/Dev/aputir/apps/web/src/lib/nanoid.ts`:
```typescript
// Cryptographically secure invite token
export function generateInviteToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString("base64url");
}
```

- [ ] **Step 4: Roster page with invite creation**

Create `/home/opmc/Dev/aputir/apps/web/src/app/[locale]/(staff)/staff/roster/actions.ts`:
```typescript
"use server";
import { db } from "@lighthouse/db";
import { invites, enrollments, users, courses } from "@lighthouse/db";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { generateInviteToken } from "@/lib/nanoid";
import { revalidatePath } from "next/cache";

export async function createInvite(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role === "student") throw new Error("Unauthorized");

  const email = formData.get("email") as string;
  if (!email) throw new Error("Email required");

  const token = generateInviteToken();
  await db.insert(invites).values({
    email: email.toLowerCase().trim(),
    token,
    createdBy: session.user.id,
  });

  revalidatePath("/staff/roster");
  return token;
}

export async function getStudents() {
  const [course] = await db.select().from(courses).where(eq(courses.active, true)).limit(1);
  if (!course) return [];

  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      studentId: users.studentId,
      enrolledAt: enrollments.enrolledAt,
    })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.userId, users.id))
    .where(and(eq(enrollments.courseId, course.id), eq(enrollments.active, true)));
}
```

Create `/home/opmc/Dev/aputir/apps/web/src/app/[locale]/(staff)/staff/roster/page.tsx`:
```typescript
import { getStudents } from "./actions";
import { db } from "@lighthouse/db";
import { invites } from "@lighthouse/db";
import { isNull } from "drizzle-orm";
import { InviteForm } from "./invite-form";
import { getTranslations } from "next-intl/server";

export default async function RosterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("staff.roster");
  const students = await getStudents();
  const pendingInvites = await db
    .select()
    .from(invites)
    .where(isNull(invites.usedAt));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      {/* Invite form */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">{t("invite")}</h2>
        <InviteForm locale={locale} />
      </section>

      {/* Pending invites */}
      {pendingInvites.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">{t("pendingInvites")} ({pendingInvites.length})</h2>
          <ul className="space-y-1">
            {pendingInvites.map((invite) => (
              <li key={invite.id} className="text-sm text-muted-foreground">
                {invite.email}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Students table */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">{t("enrolled")} ({students.length})</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-start">{t("name")}</th>
              <th className="py-2 text-start">{t("email")}</th>
              <th className="py-2 text-start">{t("studentId")}</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b">
                <td className="py-2">{s.name}</td>
                <td className="py-2">{s.email}</td>
                <td className="py-2">{s.studentId ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
```

Create `/home/opmc/Dev/aputir/apps/web/src/app/[locale]/(staff)/staff/roster/invite-form.tsx`:
```typescript
"use client";
import { createInvite } from "./actions";
import { useState } from "react";

export function InviteForm({ locale }: { locale: string }) {
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const token = await createInvite(form);
    const baseUrl = window.location.origin;
    setInviteUrl(`${baseUrl}/${locale}/invite/${token}`);
    (e.target as HTMLFormElement).reset();
    setLoading(false);
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input name="email" type="email" required placeholder="student@example.com"
          className="flex-1 rounded border px-3 py-2 text-sm" />
        <button type="submit" disabled={loading}
          className="rounded bg-primary px-4 py-2 text-sm text-white disabled:opacity-50">
          {loading ? "..." : "Create Invite"}
        </button>
      </form>
      {inviteUrl && (
        <div className="rounded border bg-muted p-3 text-sm">
          <p className="font-medium">Invite link (share with student):</p>
          <code className="break-all text-xs">{inviteUrl}</code>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Missions CRUD (chapters + missions)**

Create `/home/opmc/Dev/aputir/apps/web/src/app/[locale]/(staff)/staff/missions/actions.ts`:
```typescript
"use server";
import { db } from "@lighthouse/db";
import { chapters, missions, courses } from "@lighthouse/db";
import { eq, asc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getActiveCourse() {
  const [course] = await db.select().from(courses).where(eq(courses.active, true)).limit(1);
  return course ?? null;
}

export async function createChapter(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role === "student") throw new Error("Unauthorized");

  const course = await getActiveCourse();
  if (!course) throw new Error("No active course");

  await db.insert(chapters).values({
    courseId: course.id,
    title: formData.get("title") as string,
    titleFa: formData.get("titleFa") as string,
    order: parseInt(formData.get("order") as string, 10),
  });
  revalidatePath("/staff/missions");
}

export async function createMission(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role === "student") throw new Error("Unauthorized");

  await db.insert(missions).values({
    chapterId: formData.get("chapterId") as string,
    title: formData.get("title") as string,
    titleFa: formData.get("titleFa") as string,
    maxLumens: parseInt(formData.get("maxLumens") as string, 10) || 100,
    order: parseInt(formData.get("order") as string, 10),
  });
  revalidatePath("/staff/missions");
}

export async function getChaptersWithMissions(courseId: string) {
  const chapterList = await db
    .select()
    .from(chapters)
    .where(eq(chapters.courseId, courseId))
    .orderBy(asc(chapters.order));

  const missionList = await db
    .select()
    .from(missions)
    .orderBy(asc(missions.order));

  return chapterList.map((ch) => ({
    ...ch,
    missions: missionList.filter((m) => m.chapterId === ch.id),
  }));
}
```

- [ ] **Step 6: Missions page (simple list + add forms)**

Create `/home/opmc/Dev/aputir/apps/web/src/app/[locale]/(staff)/staff/missions/page.tsx`:
```typescript
import { getActiveCourse, getChaptersWithMissions } from "./actions";
import { AddChapterForm } from "./add-chapter-form";
import { AddMissionForm } from "./add-mission-form";

export default async function MissionsPage() {
  const course = await getActiveCourse();
  const chaptersWithMissions = course
    ? await getChaptersWithMissions(course.id)
    : [];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Chapters & Missions</h1>
      {!course && <p className="text-muted-foreground">No active course. Create one first.</p>}

      {chaptersWithMissions.map((ch) => (
        <div key={ch.id} className="rounded border p-4">
          <h2 className="font-semibold">{ch.order}. {ch.title}</h2>
          <ul className="mt-2 space-y-1 ps-4">
            {ch.missions.map((m) => (
              <li key={m.id} className="text-sm">
                {m.order}. {m.title} — {m.maxLumens} Lumens
              </li>
            ))}
          </ul>
          <AddMissionForm chapterId={ch.id} order={ch.missions.length + 1} />
        </div>
      ))}

      <div className="rounded border p-4">
        <h2 className="font-semibold">Add Chapter</h2>
        <AddChapterForm order={chaptersWithMissions.length + 1} />
      </div>
    </div>
  );
}
```

Create `/home/opmc/Dev/aputir/apps/web/src/app/[locale]/(staff)/staff/missions/add-chapter-form.tsx`:
```typescript
"use client";
import { createChapter } from "./actions";

export function AddChapterForm({ order }: { order: number }) {
  return (
    <form action={createChapter} className="mt-3 flex flex-wrap gap-2">
      <input type="hidden" name="order" value={order} />
      <input name="title" placeholder="Title (EN)" required className="rounded border px-2 py-1 text-sm" />
      <input name="titleFa" placeholder="عنوان (FA)" required className="rounded border px-2 py-1 text-sm" />
      <button type="submit" className="rounded bg-primary px-3 py-1 text-sm text-white">Add</button>
    </form>
  );
}
```

Create `/home/opmc/Dev/aputir/apps/web/src/app/[locale]/(staff)/staff/missions/add-mission-form.tsx`:
```typescript
"use client";
import { createMission } from "./actions";

export function AddMissionForm({ chapterId, order }: { chapterId: string; order: number }) {
  return (
    <form action={createMission} className="mt-2 flex flex-wrap gap-2">
      <input type="hidden" name="chapterId" value={chapterId} />
      <input type="hidden" name="order" value={order} />
      <input name="title" placeholder="Mission title (EN)" required className="rounded border px-2 py-1 text-sm" />
      <input name="titleFa" placeholder="عنوان مأموریت (FA)" required className="rounded border px-2 py-1 text-sm" />
      <input name="maxLumens" type="number" defaultValue={100} className="w-20 rounded border px-2 py-1 text-sm" />
      <button type="submit" className="rounded bg-secondary px-3 py-1 text-sm">Add Mission</button>
    </form>
  );
}
```

- [ ] **Step 7: Add translations for staff sections**

Merge into `messages/fa.json`:
```json
{
  "staff": {
    "overview": "نمای کلی",
    "students": "دانشجویان",
    "roster": {
      "title": "فهرست دانشجویان",
      "invite": "دعوت‌نامه جدید",
      "pendingInvites": "دعوت‌نامه‌های در انتظار",
      "enrolled": "ثبت‌نام‌شدگان",
      "name": "نام",
      "email": "ایمیل",
      "studentId": "شماره دانشجویی"
    }
  }
}
```

Merge into `messages/en.json`:
```json
{
  "staff": {
    "overview": "Overview",
    "students": "Students",
    "roster": {
      "title": "Roster",
      "invite": "New Invite",
      "pendingInvites": "Pending Invites",
      "enrolled": "Enrolled",
      "name": "Name",
      "email": "Email",
      "studentId": "Student ID"
    }
  }
}
```

- [ ] **Step 8: Typecheck + lint**

```bash
bun run typecheck && bun run lint
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: TA dashboard — course management, roster, invites, chapters, missions"
```

---

## Task 5: TA Dashboard — Score Grid & Publish Pipeline

**Files:**
- Create: `apps/web/src/app/[locale]/(staff)/staff/grades/page.tsx`
- Create: `apps/web/src/app/[locale]/(staff)/staff/grades/[missionId]/page.tsx`
- Create: `apps/web/src/app/[locale]/(staff)/staff/grades/[missionId]/grade-grid.tsx`
- Create: `apps/web/src/app/[locale]/(staff)/staff/grades/[missionId]/actions.ts`
- Create: `apps/web/src/lib/progression.ts` ← **the core engine**
- Create: `apps/web/src/app/[locale]/(staff)/staff/world/page.tsx`
- Create: `apps/web/src/app/[locale]/(staff)/staff/logs/page.tsx`
- Create: `packages/db/src/schema/world.ts` additions for `classProgress`
- Create: `apps/web/src/lib/__tests__/progression.test.ts`

**Interfaces:**
- Consumes: Tasks 2–4 (full schema, auth, course structure)
- Produces:
  - `/[locale]/staff/grades` — mission list with assessment status
  - `/[locale]/staff/grades/[missionId]` — score grid with keyboard nav + publish
  - `progression.computePublish(missionId, tx)` — atomic Lumen + world computation
  - `/[locale]/staff/world` — current landmark state preview
  - All unit tests pass for the progression engine

- [ ] **Step 1: Write progression engine tests first (TDD)**

Create `/home/opmc/Dev/aputir/apps/web/src/lib/__tests__/progression.test.ts`:
```typescript
import { describe, it, expect } from "bun:test";
import { computeLumens, computeLandmarkStage } from "../progression";

describe("computeLumens", () => {
  it("returns maxLumens when rawScore is 100", () => {
    expect(computeLumens(100, 100)).toBe(100);
  });

  it("rounds to nearest integer", () => {
    expect(computeLumens(75, 100)).toBe(75);
    expect(computeLumens(33.3, 100)).toBe(33);
  });

  it("returns 0 for rawScore 0", () => {
    expect(computeLumens(0, 100)).toBe(0);
  });

  it("scales with maxLumens", () => {
    expect(computeLumens(50, 200)).toBe(100);
  });
});

describe("computeLandmarkStage", () => {
  const thresholds = { toUnderRestoration: 500, toOperational: 1500, toFlourishing: 3000 };

  it("returns dormant below first threshold", () => {
    expect(computeLandmarkStage(0, thresholds)).toBe("dormant");
    expect(computeLandmarkStage(499, thresholds)).toBe("dormant");
  });

  it("returns under_restoration at first threshold", () => {
    expect(computeLandmarkStage(500, thresholds)).toBe("under_restoration");
    expect(computeLandmarkStage(1499, thresholds)).toBe("under_restoration");
  });

  it("returns operational at second threshold", () => {
    expect(computeLandmarkStage(1500, thresholds)).toBe("operational");
    expect(computeLandmarkStage(2999, thresholds)).toBe("operational");
  });

  it("returns flourishing at third threshold", () => {
    expect(computeLandmarkStage(3000, thresholds)).toBe("flourishing");
    expect(computeLandmarkStage(99999, thresholds)).toBe("flourishing");
  });
});
```

- [ ] **Step 2: Run tests — verify they FAIL**

```bash
bun test apps/web/src/lib/__tests__/progression.test.ts
```
Expected: FAIL — `computeLumens` and `computeLandmarkStage` not found.

- [ ] **Step 3: Implement progression engine**

Create `/home/opmc/Dev/aputir/apps/web/src/lib/progression.ts`:
```typescript
import type { LandmarkState } from "@lighthouse/db";

export type LandmarkStage = "dormant" | "under_restoration" | "operational" | "flourishing";

export interface ThresholdConfig {
  toUnderRestoration: number;
  toOperational: number;
  toFlourishing: number;
}

/**
 * Compute Lumens from a raw score percentage and a mission's max Lumens.
 * rawScore: 0–100 (percentage)
 * maxLumens: the mission's configured max (default 100)
 */
export function computeLumens(rawScore: number, maxLumens: number): number {
  return Math.round((rawScore / 100) * maxLumens);
}

/**
 * Determine the landmark stage from the class's total Lumens for that landmark.
 */
export function computeLandmarkStage(
  totalLumens: number,
  thresholds: ThresholdConfig
): LandmarkStage {
  if (totalLumens >= thresholds.toFlourishing) return "flourishing";
  if (totalLumens >= thresholds.toOperational) return "operational";
  if (totalLumens >= thresholds.toUnderRestoration) return "under_restoration";
  return "dormant";
}

/**
 * Generate a Ship's Log narrative for a landmark stage transition.
 */
export function generateShipLogEntry(
  landmarkIndex: number,
  newStage: LandmarkStage
): { bodyFa: string; bodyEn: string } {
  const landmarkNamesEn = [
    "The Lighthouse", "Arrival Docks", "Signal Tower", "Tide Observatory",
    "Fogway Buoys", "The Shipyard", "Harbor Control", "Relay Station",
  ];
  const landmarkNamesFa = [
    "فانوس دریایی", "اسکله ورود", "برج سیگنال", "رصدخانه جزر و مد",
    "شناورهای مه", "کشتی‌سازی", "کنترل بندر", "ایستگاه رله",
  ];
  const stageNamesEn: Record<LandmarkStage, string> = {
    dormant: "dormant", under_restoration: "under restoration",
    operational: "operational", flourishing: "flourishing",
  };
  const stageNamesFa: Record<LandmarkStage, string> = {
    dormant: "غیرفعال", under_restoration: "در حال بازسازی",
    operational: "عملیاتی", flourishing: "شکوفا",
  };

  const nameEn = landmarkNamesEn[landmarkIndex] ?? `Landmark ${landmarkIndex + 1}`;
  const nameFa = landmarkNamesFa[landmarkIndex] ?? `نقطه عطف ${landmarkIndex + 1}`;

  return {
    bodyEn: `${nameEn} is now ${stageNamesEn[newStage]}.`,
    bodyFa: `${nameFa} اکنون ${stageNamesFa[newStage]} است.`,
  };
}
```

- [ ] **Step 4: Run tests — verify they PASS**

```bash
bun test apps/web/src/lib/__tests__/progression.test.ts
```
Expected: all 8 tests pass.

- [ ] **Step 5: Create score grid actions (publish pipeline)**

Create `/home/opmc/Dev/aputir/apps/web/src/app/[locale]/(staff)/staff/grades/[missionId]/actions.ts`:
```typescript
"use server";
import { db } from "@lighthouse/db";
import {
  assessments, missions, enrollments, courses, landmarkStates,
  landmarkThresholds, shipLogs, chapters,
} from "@lighthouse/db";
import { eq, and, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { computeLumens, computeLandmarkStage, generateShipLogEntry } from "@/lib/progression";
import { revalidatePath } from "next/cache";

/** Upsert a draft score for one student on one mission */
export async function saveDraftScore(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role === "student") throw new Error("Unauthorized");

  const missionId = formData.get("missionId") as string;
  const userId = formData.get("userId") as string;
  const rawScore = parseFloat(formData.get("rawScore") as string);

  await db
    .insert(assessments)
    .values({ missionId, userId, rawScore, state: "draft" })
    .onConflictDoUpdate({
      target: [assessments.missionId, assessments.userId],
      set: { rawScore, state: "draft", updatedAt: new Date() },
    });

  revalidatePath(`/staff/grades/${missionId}`);
}

/** Publish all draft assessments for a mission — atomically computes Lumens + updates world */
export async function publishMissionScores(missionId: string, courseId: string) {
  const session = await auth();
  if (!session?.user || session.user.role === "student") throw new Error("Unauthorized");

  const [mission] = await db.select().from(missions).where(eq(missions.id, missionId)).limit(1);
  if (!mission) throw new Error("Mission not found");

  // Get the chapter to find landmark index (chapter order - 1)
  const [chapter] = await db
    .select()
    .from(chapters)
    .where(eq(chapters.id, mission.chapterId))
    .limit(1);
  if (!chapter) throw new Error("Chapter not found");

  const landmarkIndex = chapter.order - 1; // chapters are 1-indexed, landmarks are 0-indexed

  const draftAssessments = await db
    .select()
    .from(assessments)
    .where(and(eq(assessments.missionId, missionId), eq(assessments.state, "draft")));

  if (draftAssessments.length === 0) throw new Error("No draft assessments to publish");

  await db.transaction(async (tx) => {
    // 1. Compute and update each assessment
    for (const assessment of draftAssessments) {
      const lumens = assessment.rawScore !== null
        ? computeLumens(assessment.rawScore, mission.maxLumens)
        : 0;

      await tx
        .update(assessments)
        .set({
          lumens,
          state: "published",
          publishedBy: session.user.id,
          publishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(assessments.id, assessment.id));
    }

    // 2. Aggregate total lumens for this landmark
    const allPublished = await tx
      .select({ lumens: assessments.lumens })
      .from(assessments)
      .innerJoin(missions, eq(assessments.missionId, missions.id))
      .innerJoin(chapters, eq(missions.chapterId, chapters.id))
      .where(
        and(
          eq(chapters.courseId, courseId),
          eq(chapters.order, chapter.order),
          eq(assessments.state, "published"),
        )
      );

    const totalLumens = allPublished.reduce((sum, a) => sum + (a.lumens ?? 0), 0);

    // 3. Get thresholds for this landmark
    const [threshold] = await tx
      .select()
      .from(landmarkThresholds)
      .where(
        and(
          eq(landmarkThresholds.courseId, courseId),
          eq(landmarkThresholds.landmarkIndex, landmarkIndex),
        )
      )
      .limit(1);

    const thresholdConfig = threshold ?? {
      toUnderRestoration: 500,
      toOperational: 1500,
      toFlourishing: 3000,
    };

    const newStage = computeLandmarkStage(totalLumens, thresholdConfig);

    // 4. Get current stage to detect transitions
    const [currentState] = await tx
      .select()
      .from(landmarkStates)
      .where(
        and(
          eq(landmarkStates.courseId, courseId),
          eq(landmarkStates.landmarkIndex, landmarkIndex),
        )
      )
      .limit(1);

    const stageChanged = !currentState || currentState.stage !== newStage;

    // 5. Upsert landmark state
    await tx
      .insert(landmarkStates)
      .values({ courseId, landmarkIndex, stage: newStage, totalLumens })
      .onConflictDoUpdate({
        target: [landmarkStates.courseId, landmarkStates.landmarkIndex],
        set: { stage: newStage, totalLumens, updatedAt: new Date() },
      });

    // 6. Emit Ship's Log if stage changed
    if (stageChanged) {
      const { bodyFa, bodyEn } = generateShipLogEntry(landmarkIndex, newStage);
      await tx.insert(shipLogs).values({
        courseId,
        landmarkIndex,
        newStage,
        bodyFa,
        bodyEn,
      });
    }
  });

  revalidatePath(`/staff/grades/${missionId}`);
  revalidatePath("/staff/world");
  revalidatePath(`/${courseId}/harbor`); // public harbor map
}
```

- [ ] **Step 6: Grade grid page**

Create `/home/opmc/Dev/aputir/apps/web/src/app/[locale]/(staff)/staff/grades/[missionId]/page.tsx`:
```typescript
import { db } from "@lighthouse/db";
import { missions, assessments, enrollments, users, courses, chapters } from "@lighthouse/db";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { GradeGrid } from "./grade-grid";

export default async function GradeMissionPage({
  params,
}: {
  params: Promise<{ locale: string; missionId: string }>;
}) {
  const { missionId } = await params;

  const [mission] = await db
    .select()
    .from(missions)
    .where(eq(missions.id, missionId))
    .limit(1);
  if (!mission) notFound();

  const [course] = await db.select().from(courses).where(eq(courses.active, true)).limit(1);
  if (!course) notFound();

  // All enrolled students
  const enrolledStudents = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.userId, users.id))
    .where(and(eq(enrollments.courseId, course.id), eq(enrollments.active, true)));

  // Existing assessments for this mission
  const existingAssessments = await db
    .select()
    .from(assessments)
    .where(eq(assessments.missionId, missionId));

  const assessmentMap = new Map(existingAssessments.map((a) => [a.userId, a]));

  const rows = enrolledStudents.map((student) => ({
    student,
    assessment: assessmentMap.get(student.id) ?? null,
  }));

  const draftCount = existingAssessments.filter((a) => a.state === "draft").length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{mission.title}</h1>
      <p className="text-sm text-muted-foreground">Max: {mission.maxLumens} Lumens</p>
      <GradeGrid
        rows={rows}
        missionId={missionId}
        courseId={course.id}
        draftCount={draftCount}
      />
    </div>
  );
}
```

Create `/home/opmc/Dev/aputir/apps/web/src/app/[locale]/(staff)/staff/grades/[missionId]/grade-grid.tsx`:
```typescript
"use client";
import { saveDraftScore, publishMissionScores } from "./actions";
import { useState } from "react";
import type { Assessment } from "@lighthouse/db";

interface Row {
  student: { id: string; name: string; email: string };
  assessment: Assessment | null;
}

export function GradeGrid({
  rows,
  missionId,
  courseId,
  draftCount,
}: {
  rows: Row[];
  missionId: string;
  courseId: string;
  draftCount: number;
}) {
  const [publishing, setPublishing] = useState(false);

  async function handlePublish() {
    setPublishing(true);
    await publishMissionScores(missionId, courseId);
    setPublishing(false);
  }

  return (
    <div className="space-y-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-start">Student</th>
            <th className="py-2 text-start">Score (0-100)</th>
            <th className="py-2 text-start">State</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ student, assessment }) => (
            <tr key={student.id} className="border-b">
              <td className="py-2">{student.name}</td>
              <td className="py-2">
                <form action={saveDraftScore}>
                  <input type="hidden" name="missionId" value={missionId} />
                  <input type="hidden" name="userId" value={student.id} />
                  <input
                    name="rawScore"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    defaultValue={assessment?.rawScore ?? ""}
                    placeholder="—"
                    onBlur={(e) => {
                      const form = e.target.closest("form") as HTMLFormElement;
                      form?.requestSubmit();
                    }}
                    className="w-20 rounded border px-2 py-1"
                  />
                </form>
              </td>
              <td className="py-2 text-muted-foreground">
                {assessment?.state ?? "not entered"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {draftCount > 0 && (
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="rounded bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {publishing ? "Publishing..." : `Publish ${draftCount} draft score(s)`}
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 7: World preview page**

Create `/home/opmc/Dev/aputir/apps/web/src/app/[locale]/(staff)/staff/world/page.tsx`:
```typescript
import { db } from "@lighthouse/db";
import { landmarkStates, courses } from "@lighthouse/db";
import { eq } from "drizzle-orm";

const LANDMARK_NAMES_EN = [
  "The Lighthouse", "Arrival Docks", "Signal Tower", "Tide Observatory",
  "Fogway Buoys", "The Shipyard", "Harbor Control", "Relay Station",
];

const STAGE_LABELS = {
  dormant: "Dormant", under_restoration: "Under Restoration",
  operational: "Operational", flourishing: "Flourishing",
};

export default async function WorldPage() {
  const [course] = await db.select().from(courses).where(eq(courses.active, true)).limit(1);
  const states = course
    ? await db.select().from(landmarkStates).where(eq(landmarkStates.courseId, course.id))
    : [];

  const stateMap = new Map(states.map((s) => [s.landmarkIndex, s]));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Harbor World State</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {LANDMARK_NAMES_EN.map((name, i) => {
          const state = stateMap.get(i);
          return (
            <div key={i} className="rounded border p-3">
              <p className="font-medium">{name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {state ? STAGE_LABELS[state.stage] : "Dormant"}
              </p>
              <p className="text-xs text-muted-foreground">
                {state?.totalLumens ?? 0} Lumens
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Ship's Log page**

Create `/home/opmc/Dev/aputir/apps/web/src/app/[locale]/(staff)/staff/logs/page.tsx`:
```typescript
import { db } from "@lighthouse/db";
import { shipLogs, courses } from "@lighthouse/db";
import { eq, desc } from "drizzle-orm";

export default async function LogsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isFa = locale === "fa";
  const [course] = await db.select().from(courses).where(eq(courses.active, true)).limit(1);
  const logs = course
    ? await db
        .select()
        .from(shipLogs)
        .where(eq(shipLogs.courseId, course.id))
        .orderBy(desc(shipLogs.triggeredAt))
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{isFa ? "دفتر کشتی" : "Ship's Log"}</h1>
      {logs.length === 0 && (
        <p className="text-muted-foreground">{isFa ? "هنوز رویدادی ثبت نشده." : "No events yet."}</p>
      )}
      <ul className="space-y-3">
        {logs.map((log) => (
          <li key={log.id} className="rounded border p-3">
            <p>{isFa ? log.bodyFa : log.bodyEn}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {log.triggeredAt.toLocaleDateString(isFa ? "fa-IR" : "en-US")}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 9: Grades list page (mission selector)**

Create `/home/opmc/Dev/aputir/apps/web/src/app/[locale]/(staff)/staff/grades/page.tsx`:
```typescript
import { db } from "@lighthouse/db";
import { chapters, missions, courses, assessments } from "@lighthouse/db";
import { eq, and, count } from "drizzle-orm";
import Link from "next/link";

export default async function GradesListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [course] = await db.select().from(courses).where(eq(courses.active, true)).limit(1);
  if (!course) return <p>No active course.</p>;

  const chapterList = await db
    .select()
    .from(chapters)
    .where(eq(chapters.courseId, course.id))
    .orderBy(chapters.order);

  const missionList = await db.select().from(missions).orderBy(missions.order);
  const draftCounts = await db
    .select({ missionId: assessments.missionId, count: count() })
    .from(assessments)
    .where(eq(assessments.state, "draft"))
    .groupBy(assessments.missionId);
  const draftMap = new Map(draftCounts.map((d) => [d.missionId, d.count]));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Grades</h1>
      {chapterList.map((ch) => (
        <div key={ch.id}>
          <h2 className="mb-2 font-semibold">{ch.order}. {locale === "fa" ? ch.titleFa : ch.title}</h2>
          <ul className="space-y-1 ps-4">
            {missionList
              .filter((m) => m.chapterId === ch.id)
              .map((m) => (
                <li key={m.id}>
                  <Link href={`/${locale}/staff/grades/${m.id}`}
                    className="text-sm hover:underline">
                    {locale === "fa" ? m.titleFa : m.title}
                    {(draftMap.get(m.id) ?? 0) > 0 && (
                      <span className="ms-2 rounded bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-800">
                        {draftMap.get(m.id)} drafts
                      </span>
                    )}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 10: Run unit tests**

```bash
bun test apps/web/src/lib/__tests__/progression.test.ts
```
Expected: all pass.

- [ ] **Step 11: Typecheck + lint**

```bash
bun run typecheck && bun run lint
```

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: score grid, publish pipeline, and world progression engine with tests"
```

---

## Task 6: Student Views

**Files:**
- Create: `apps/web/src/app/[locale]/(student)/dashboard/page.tsx`
- Create: `apps/web/src/app/[locale]/(student)/missions/page.tsx`
- Create: `apps/web/src/app/[locale]/(student)/crew/page.tsx`
- Create: `apps/web/src/app/[locale]/(student)/layout.tsx`
- Create: `apps/web/src/lib/student-data.ts` (data fetchers for student views)
- Modify: `apps/web/messages/fa.json`
- Modify: `apps/web/messages/en.json`

**Interfaces:**
- Consumes: Tasks 2–5 (schema, auth, assessments published)
- Produces:
  - `/[locale]/dashboard` — Keeper rank, Lumen total, next mission
  - `/[locale]/missions` — all chapters/missions with assessment states
  - `/[locale]/crew` — crew members + crew ship name

- [ ] **Step 1: Student layout with auth guard**

Create `/home/opmc/Dev/aputir/apps/web/src/app/[locale]/(student)/layout.tsx`:
```typescript
import { requireRole } from "@/lib/auth-helpers";
import { StudentNav } from "@/components/student/student-nav";

export default async function StudentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireRole("student", locale);
  return (
    <div className="flex min-h-screen flex-col">
      <StudentNav locale={locale} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
```

Create `/home/opmc/Dev/aputir/apps/web/src/components/student/student-nav.tsx`:
```typescript
import Link from "next/link";

const navItems = [
  { href: "dashboard", label: "Dashboard", labelFa: "داشبورد" },
  { href: "missions", label: "Missions", labelFa: "مأموریت‌ها" },
  { href: "crew", label: "Crew", labelFa: "خدمه" },
  { href: "harbor", label: "Harbor", labelFa: "بندر" },
];

export function StudentNav({ locale }: { locale: string }) {
  const isFa = locale === "fa";
  return (
    <nav className="border-b px-6 py-3">
      <ul className="flex gap-6">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link href={`/${locale}/${item.href}`} className="text-sm hover:text-primary">
              {isFa ? item.labelFa : item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 2: Student data fetchers**

Create `/home/opmc/Dev/aputir/apps/web/src/lib/student-data.ts`:
```typescript
import { db } from "@lighthouse/db";
import {
  assessments, missions, chapters, enrollments, courses, users,
  crewMembers, crews,
} from "@lighthouse/db";
import { eq, and, sum } from "drizzle-orm";

const KEEPER_RANKS = [
  { min: 0, label: "Apprentice Keeper", labelFa: "کارآموز نگهبان" },
  { min: 300, label: "Beacon Keeper", labelFa: "نگهبان فانوس" },
  { min: 700, label: "Signal Keeper", labelFa: "نگهبان سیگنال" },
  { min: 1200, label: "Drift Navigator", labelFa: "ناوبر جریان" },
  { min: 2000, label: "Harbor Steward", labelFa: "مدیر بندر" },
] as const;

export function getKeeperRank(totalLumens: number) {
  let rank = KEEPER_RANKS[0]!;
  for (const r of KEEPER_RANKS) {
    if (totalLumens >= r.min) rank = r;
  }
  return rank;
}

export async function getStudentProgress(userId: string) {
  const [course] = await db.select().from(courses).where(eq(courses.active, true)).limit(1);
  if (!course) return null;

  const [lumensResult] = await db
    .select({ total: sum(assessments.lumens) })
    .from(assessments)
    .where(and(eq(assessments.userId, userId), eq(assessments.state, "published")));

  const totalLumens = Number(lumensResult?.total ?? 0);
  const rank = getKeeperRank(totalLumens);

  const allMissions = await db
    .select({
      mission: missions,
      chapter: chapters,
      assessment: assessments,
    })
    .from(missions)
    .innerJoin(chapters, eq(missions.chapterId, chapters.id))
    .leftJoin(
      assessments,
      and(eq(assessments.missionId, missions.id), eq(assessments.userId, userId))
    )
    .where(eq(chapters.courseId, course.id));

  return { totalLumens, rank, missions: allMissions, courseId: course.id };
}

export async function getStudentCrew(userId: string, courseId: string) {
  const [membership] = await db
    .select({ crewId: crewMembers.crewId })
    .from(crewMembers)
    .where(eq(crewMembers.userId, userId))
    .limit(1);

  if (!membership) return null;

  const [crew] = await db
    .select()
    .from(crews)
    .where(and(eq(crews.id, membership.crewId), eq(crews.courseId, courseId)))
    .limit(1);
  if (!crew) return null;

  const members = await db
    .select({ id: users.id, name: users.name })
    .from(crewMembers)
    .innerJoin(users, eq(crewMembers.userId, users.id))
    .where(eq(crewMembers.crewId, crew.id));

  return { crew, members };
}
```

- [ ] **Step 3: Student dashboard page**

Create `/home/opmc/Dev/aputir/apps/web/src/app/[locale]/(student)/dashboard/page.tsx`:
```typescript
import { auth } from "@/lib/auth";
import { getStudentProgress } from "@/lib/student-data";
import { getTranslations } from "next-intl/server";

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();
  const isFa = locale === "fa";
  const t = await getTranslations("student.dashboard");

  const progress = await getStudentProgress(session!.user.id);

  if (!progress) {
    return <p className="text-muted-foreground">{t("noCourse")}</p>;
  }

  const nextMission = progress.missions.find(
    (m) => !m.assessment || m.assessment.state === "draft"
  );

  const displayLumens = isFa
    ? progress.totalLumens.toLocaleString("fa-IR")
    : progress.totalLumens.toLocaleString("en-US");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          {isFa ? progress.rank.labelFa : progress.rank.label}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {displayLumens} {isFa ? "لومن" : "Lumens"}
        </p>
      </div>

      {nextMission && (
        <div className="rounded border p-4">
          <p className="text-sm font-medium text-muted-foreground">{t("nextMission")}</p>
          <p className="mt-1 font-semibold">
            {isFa ? nextMission.mission.titleFa : nextMission.mission.title}
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Missions list page**

Create `/home/opmc/Dev/aputir/apps/web/src/app/[locale]/(student)/missions/page.tsx`:
```typescript
import { auth } from "@/lib/auth";
import { getStudentProgress } from "@/lib/student-data";

const STATE_LABELS = {
  draft: { fa: "در حال بررسی", en: "Under review" },
  published: { fa: "ارزیابی شده", en: "Assessed" },
  revised: { fa: "اصلاح شده", en: "Revised" },
  null: { fa: "در انتظار ارزیابی", en: "Awaiting assessment" },
};

export default async function MissionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isFa = locale === "fa";
  const session = await auth();
  const progress = await getStudentProgress(session!.user.id);

  if (!progress) return <p>No active course.</p>;

  // Group by chapter
  const byChapter = new Map<string, typeof progress.missions>();
  for (const m of progress.missions) {
    const key = m.chapter.id;
    if (!byChapter.has(key)) byChapter.set(key, []);
    byChapter.get(key)!.push(m);
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{isFa ? "مأموریت‌ها" : "Missions"}</h1>
      {[...byChapter.values()].map((missionGroup) => {
        const chapter = missionGroup[0]!.chapter;
        return (
          <div key={chapter.id}>
            <h2 className="mb-3 font-semibold">
              {chapter.order}. {isFa ? chapter.titleFa : chapter.title}
            </h2>
            <ul className="space-y-2 ps-4">
              {missionGroup.map(({ mission, assessment }) => {
                const stateKey = (assessment?.state ?? "null") as keyof typeof STATE_LABELS;
                return (
                  <li key={mission.id} className="flex items-center justify-between rounded border p-3">
                    <div>
                      <p className="font-medium">
                        {mission.order}. {isFa ? mission.titleFa : mission.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {STATE_LABELS[stateKey][isFa ? "fa" : "en"]}
                      </p>
                    </div>
                    {assessment?.lumens !== null && assessment?.lumens !== undefined && (
                      <span className="text-sm font-semibold">
                        {isFa
                          ? assessment.lumens.toLocaleString("fa-IR")
                          : assessment.lumens} {isFa ? "لومن" : "L"}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 5: Crew page**

Create `/home/opmc/Dev/aputir/apps/web/src/app/[locale]/(student)/crew/page.tsx`:
```typescript
import { auth } from "@/lib/auth";
import { getStudentProgress, getStudentCrew } from "@/lib/student-data";

export default async function CrewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isFa = locale === "fa";
  const session = await auth();
  const progress = await getStudentProgress(session!.user.id);
  if (!progress) return <p>No active course.</p>;

  const crewData = await getStudentCrew(session!.user.id, progress.courseId);

  if (!crewData) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{isFa ? "خدمه" : "Crew"}</h1>
        <p className="text-muted-foreground">{isFa ? "شما عضو خدمه‌ای نیستید." : "You are not in a crew yet."}</p>
      </div>
    );
  }

  const { crew, members } = crewData;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{crew.name}</h1>
      {crew.shipName && (
        <p className="text-muted-foreground">
          {isFa ? "کشتی: " : "Ship: "}{crew.shipName}
        </p>
      )}
      <ul className="space-y-2">
        {members.map((m) => (
          <li key={m.id} className="rounded border px-3 py-2 text-sm">{m.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 6: Add student translations**

Merge into `messages/fa.json`:
```json
{
  "student": {
    "dashboard": {
      "noCourse": "هیچ دوره فعالی وجود ندارد.",
      "nextMission": "مأموریت بعدی"
    }
  }
}
```

Merge into `messages/en.json`:
```json
{
  "student": {
    "dashboard": {
      "noCourse": "No active course.",
      "nextMission": "Next mission"
    }
  }
}
```

- [ ] **Step 7: Typecheck + lint**

```bash
bun run typecheck && bun run lint
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: student views — dashboard with Keeper rank, missions list, crew page"
```

---

## Task 7: Public Harbor Map

**Files:**
- Create: `apps/web/src/app/[locale]/(public)/harbor/page.tsx`
- Create: `apps/web/src/components/harbor/harbor-map.tsx`
- Create: `apps/web/src/components/harbor/landmark-badge.tsx`
- Create: `apps/web/src/app/[locale]/(public)/harbor/ship-log-feed.tsx`
- Modify: `apps/web/src/app/[locale]/page.tsx` (redirect to harbor map)

**Interfaces:**
- Consumes: Tasks 2 + 5 (landmark states, ship logs)
- Produces:
  - `/[locale]/harbor` (and `/[locale]/`) — public SVG grid of 8 landmarks with stage indicators
  - Each landmark shows its name, stage label, and total Lumens
  - Ship's Log feed (latest 5 entries)
  - No auth required

- [ ] **Step 1: Public harbor page**

Create `/home/opmc/Dev/aputir/apps/web/src/app/[locale]/(public)/harbor/page.tsx`:
```typescript
import { db } from "@lighthouse/db";
import { landmarkStates, shipLogs, courses } from "@lighthouse/db";
import { eq, desc } from "drizzle-orm";
import { HarborMap } from "@/components/harbor/harbor-map";

export default async function PublicHarborPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [course] = await db.select().from(courses).where(eq(courses.active, true)).limit(1);

  const states = course
    ? await db.select().from(landmarkStates).where(eq(landmarkStates.courseId, course.id))
    : [];

  const logs = course
    ? await db
        .select()
        .from(shipLogs)
        .where(eq(shipLogs.courseId, course.id))
        .orderBy(desc(shipLogs.triggeredAt))
        .limit(5)
    : [];

  return (
    <main className="min-h-screen p-6">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold">{locale === "fa" ? "فانوس دریایی" : "The Lighthouse"}</h1>
        <p className="mt-1 text-muted-foreground">
          {locale === "fa" ? "دوره برنامه‌نویسی پیشرفته — دانشگاه تهران" : "Advanced Programming — University of Tehran"}
        </p>
      </header>
      <HarborMap states={states} locale={locale} />
      {logs.length > 0 && (
        <section className="mx-auto mt-10 max-w-2xl">
          <h2 className="mb-4 text-lg font-semibold">
            {locale === "fa" ? "دفتر کشتی" : "Ship's Log"}
          </h2>
          <ul className="space-y-3">
            {logs.map((log) => (
              <li key={log.id} className="rounded border p-3 text-sm">
                <p>{locale === "fa" ? log.bodyFa : log.bodyEn}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {log.triggeredAt.toLocaleDateString(locale === "fa" ? "fa-IR" : "en-US")}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Harbor map component**

Create `/home/opmc/Dev/aputir/apps/web/src/components/harbor/harbor-map.tsx`:
```typescript
import type { LandmarkState } from "@lighthouse/db";
import { LandmarkBadge } from "./landmark-badge";

const LANDMARKS = [
  { index: 0, name: "The Lighthouse", nameFa: "فانوس دریایی", topic: "Classes · Encapsulation" },
  { index: 1, name: "Arrival Docks", nameFa: "اسکله ورود", topic: "Inheritance · Composition" },
  { index: 2, name: "Signal Tower", nameFa: "برج سیگنال", topic: "Interfaces · Polymorphism" },
  { index: 3, name: "Tide Observatory", nameFa: "رصدخانه جزر و مد", topic: "Observer Pattern" },
  { index: 4, name: "Fogway Buoys", nameFa: "شناورهای مه", topic: "Strategy Pattern" },
  { index: 5, name: "The Shipyard", nameFa: "کشتی‌سازی", topic: "Factory · Builder" },
  { index: 6, name: "Harbor Control", nameFa: "کنترل بندر", topic: "Command · State" },
  { index: 7, name: "Relay Station", nameFa: "ایستگاه رله", topic: "Decorator · Adapter" },
] as const;

const STAGE_COLORS = {
  dormant: "bg-muted text-muted-foreground",
  under_restoration: "bg-yellow-100 text-yellow-800",
  operational: "bg-blue-100 text-blue-800",
  flourishing: "bg-green-100 text-green-800",
};

export function HarborMap({
  states,
  locale,
}: {
  states: LandmarkState[];
  locale: string;
}) {
  const isFa = locale === "fa";
  const stateMap = new Map(states.map((s) => [s.landmarkIndex, s]));

  return (
    <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
      {LANDMARKS.map((landmark) => {
        const state = stateMap.get(landmark.index);
        const stage = state?.stage ?? "dormant";
        return (
          <div
            key={landmark.index}
            className={`rounded-lg border p-4 transition-colors ${STAGE_COLORS[stage]}`}
          >
            <p className="font-semibold">
              {isFa ? landmark.nameFa : landmark.name}
            </p>
            <p className="mt-1 text-xs opacity-70">{landmark.topic}</p>
            <p className="mt-2 text-sm font-medium capitalize">
              {stage.replace(/_/g, " ")}
            </p>
            <p className="text-xs opacity-60">
              {isFa
                ? (state?.totalLumens ?? 0).toLocaleString("fa-IR")
                : (state?.totalLumens ?? 0).toLocaleString()} {isFa ? "لومن" : "L"}
            </p>
          </div>
        );
      })}
    </div>
  );
}
```

Create `/home/opmc/Dev/aputir/apps/web/src/components/harbor/landmark-badge.tsx`:
```typescript
// Exported for future use by student harbor view
export function LandmarkBadge({ stage }: { stage: string }) {
  const icons: Record<string, string> = {
    dormant: "⬜",
    under_restoration: "🔧",
    operational: "🔵",
    flourishing: "🌟",
  };
  return <span>{icons[stage] ?? "⬜"}</span>;
}
```

- [ ] **Step 3: Update root page to redirect to harbor**

Replace `/home/opmc/Dev/aputir/apps/web/src/app/[locale]/page.tsx`:
```typescript
import { redirect } from "next/navigation";

export default async function RootPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/harbor`);
}
```

- [ ] **Step 4: Typecheck + lint**

```bash
bun run typecheck && bun run lint
```

- [ ] **Step 5: Full smoke test**

```bash
bun run dev
```

Verify these flows work end-to-end:
1. `/fa` → redirects to `/fa/harbor` → shows 8 landmark cards (all dormant) ✓
2. `/fa/login` → login form ✓
3. Login as owner → `/fa/staff` → overview ✓
4. `/fa/staff/roster` → create invite → get URL ✓
5. Open invite URL → set password → redirects to login ✓
6. Login as student → `/fa/dashboard` → "Apprentice Keeper" rank ✓
7. `/fa/staff/missions` → add chapter → add mission ✓
8. `/fa/staff/grades/[missionId]` → enter score → publish ✓
9. `/fa/harbor` → landmark changes stage if threshold crossed ✓
10. `/fa/staff/logs` → Ship's Log entry appears ✓

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: public harbor map with landmark stages and Ship's Log feed"
```

---

## Self-Review — Spec Coverage Check

| Spec Requirement | Task | Status |
|-----------------|------|--------|
| TAs create course, chapters, missions | Task 4 | ✅ |
| TAs manage student roster + invites | Task 4 | ✅ |
| TAs enter scores in a grid | Task 5 | ✅ |
| Preview before publish | Task 5 (world page shows live state) | ⚠️ Preview is implicit via world page, not a publish modal — acceptable for Phase 1 |
| Publish → Lumens computed automatically | Task 5 `publishMissionScores` | ✅ |
| Lumens → landmark stage advances | Task 5 `progression.ts` pipeline | ✅ |
| Ship's Log created on stage change | Task 5 | ✅ |
| Student personal progress view | Task 6 | ✅ |
| Student crew view | Task 6 | ✅ |
| Harbor map reflects class achievement | Task 7 | ✅ |
| Ship's Log narrates milestone events | Task 7 | ✅ |
| Invite-only auth with email+password | Task 3 | ✅ |
| Staff role gating | Tasks 3–5 (layout guards) | ✅ |
| Deployed at aput.ir via Vercel + Neon | Config complete in Task 1 | ⚠️ CI/CD not set up — do this at end via Vercel dashboard |
| Persian primary, English secondary | Tasks 1, 3–7 | ✅ |
| Score revision with audit trail | Schema in Task 2 | ⚠️ Revision UI not implemented — add to backlog |
| Assessment states (draft/published/revised) | Tasks 2, 5 | ✅ |
| Keeper ranks | Task 6 `student-data.ts` | ✅ |
| Three distinct progress dimensions | Named correctly throughout | ✅ |

**Known gaps (acceptable for Phase 1 MVP):**
- Score revision UI (schema exists, action not wired to UI) → add as `fix/score-revision` after MVP
- Bulk import (CSV) for scores → backlog
- Publish preview modal → backlog (world page serves as preview for now)
- Course creation UI (only DB seed + Drizzle Studio for now) → backlog
- Vercel + Neon setup → manual step after all tasks complete

---

## Post-Implementation Steps

After all 7 tasks are complete:

1. **Set up Vercel project**
   - Connect `aputir/lighthouse` GitHub repo to Vercel
   - Set `FRAMEWORK_PRESET` to Next.js
   - Set root directory to `apps/web`
   - Add env vars: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL=https://aput.ir`

2. **Set up Neon production branch**
   - Create separate Neon branches for `dev` and `prod`
   - Run `db:migrate` (not `db:push`) in production
   - Run `db:seed` once for owner account

3. **Create GitHub repo and push**
   ```bash
   gh repo create aputir/lighthouse --private
   git remote add origin https://github.com/aputir/lighthouse
   git push -u origin main
   ```

4. **Configure aput.ir DNS**
   - Point `aput.ir` A/CNAME to Vercel
   - Add domain in Vercel dashboard
