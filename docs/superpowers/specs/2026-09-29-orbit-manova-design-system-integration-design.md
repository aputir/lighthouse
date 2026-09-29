# Design Spec: Orbit / Manova Design System Integration for Lighthouse (aputir)

- **Date:** 2026-09-29
- **Status:** Approved
- **Scope:** Monorepo package creation (`packages/ui`), theming layer setup, and full-pass UI migration across public, student, and staff views.

---

## 1. Problem & Context

Lighthouse (`aputir`) is the course gamification platform for the Advanced Programming course at the University of Tehran (CS Department, Autumn 2026). The platform features an automated "Score → World" progression engine, student dashboards, a public harbor map, and TA administration tools.

Prior to this work, the UI layer in `apps/web`:
- Used raw HTML tags (`<input>`, `<button>`, `<form>`) and unconstrained inline Tailwind CSS.
- Did not implement `packages/ui` (originally specified in `WORKSPACE_INDEX.md`).
- Diverged from the Manova / Goldstein design system conventions established in `orbit-frontend` (`~/Dev/Manova/orbit/orbit-frontend`) and `manovaspace/design-system` (`~/Dev/Manova/manovaspace/design-system`), which standardizes on `@manovaspace/tokens` and shadcn-wrapped `@manovaspace/ui` primitives.

This design establishes a clean, production-grade integration of the Orbit/Manova design system into `aputir`.

---

## 2. Architecture & Package Strategy

### 2.1 Monorepo Workspace: `packages/ui` (`@lighthouse/ui`)
A new internal package `packages/ui` is established in the monorepo:
- **Package Name:** `@lighthouse/ui`
- **Dependencies:**
  - `@manovaspace/tokens@^0.1.3` (published on npm)
  - `@manovaspace/ui@^0.3.0` (published on npm)
  - React 19 / React DOM 19 peer dependencies
- **Exports:**
  - `.` (Main entry): Re-exports core primitives from `@manovaspace/ui`:
    - **Primitives:** `Button`, `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `Input`, `Label`, `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogTrigger`, `DialogClose`, `Table`, `TableBody`, `TableCaption`, `TableCell`, `TableFooter`, `TableHead`, `TableHeader`, `TableRow`, `Badge`, `badgeVariants`, `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`, `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuTrigger`, `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger`, `Skeleton`, `Toast`, `Toaster`, `Progress`, `Spinner`, `Alert`, `AlertDescription`, `AlertTitle`, `Avatar`, `AvatarFallback`, `AvatarImage`, `Collapsible`, `CollapsibleContent`, `CollapsibleTrigger`, `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`, `Tooltip`, `TooltipContent`, `TooltipProvider`, `TooltipTrigger`
    - **Composed:** `EmptyState`, `ConfirmDialog`, `DataValue`, `formatDataValue`, `FieldGroup`, `FieldMessage`, `FieldDescription`, `HoldToConfirmButton`
    - **Shell:** `ShellHeader`, `useShellMenuState`, `NavRail`, `NavTree`, `NavMobileSheet` (with all associated types: `NavItemConfig`, `NavSubsection`, `NavTreeProps`, `ShellHeaderProps`)
    - **Utilities:** `cn`, `useToast`, `toast`, `toLocaleDigits`, `persianizeDigits`, `formatLocaleInteger`
  - `./icons`: Re-exports unified icons from `@manovaspace/ui/icons`.
  - Domain components: Lighthouse-specific UI components adhering strictly to Manova tokens (`LandmarkStageBadge`, `KeeperRankCard`, `LumenProgress`, `ShipLogFeedCard`).

### 2.2 Theming & Tailwind CSS v4 in `apps/web`
`apps/web/src/app/globals.css` imports `@manovaspace/tokens` and `@manovaspace/ui` styles and binds `@theme inline` directly to the semantic CSS custom properties:

```css
@import "tailwindcss";
@import "@manovaspace/tokens/fonts.css";
@import "@manovaspace/tokens/tokens.css";
@import "@manovaspace/ui/styles.css";
@import "../components/harbor/harbor.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-surface-sunken: var(--surface-sunken);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-destructive: var(--destructive);
  --color-status-success: var(--status-success);
  --color-status-success-foreground: var(--status-success-foreground);
  --color-status-warning: var(--status-warning);
  --color-status-warning-foreground: var(--status-warning-foreground);
  --color-status-danger: var(--status-danger);
  --color-status-danger-foreground: var(--status-danger-foreground);
}
```

### 2.3 Next.js Configuration Changes
- **`apps/web/next.config.ts`**: Add `transpilePackages: ["@manovaspace/ui", "@manovaspace/tokens", "@lighthouse/ui"]` so Next.js compiles these packages correctly.
- **Font Migration**: Remove `@fontsource-variable/estedad` from `apps/web/package.json` dependencies and its manual `import "@fontsource-variable/estedad"` in `apps/web/src/app/[locale]/layout.tsx`. Fonts are now provided by `@manovaspace/tokens/fonts.css` (which bundles `@fontsource/estedad`, `@fontsource/inter`, `@fontsource/ibm-plex-mono`, `@fontsource/vazirmatn`).
- **Body Class**: Change `body` className from `font-estedad` to `font-sans` (which maps to `var(--font-sans)` from `@manovaspace/tokens`).

### 2.4 Non-Negotiable Conventions
1. **Zero Hardcoded Colors:** No `#hex` color literals in component class names. Only semantic utility classes (`bg-background`, `bg-card`, `text-primary`, `border-border`, etc.).
2. **Unified Icons:** No direct imports from `lucide-react` or `react-icons`. All icons must be imported from `@lighthouse/ui/icons` (or `@manovaspace/ui/icons`).
3. **Persian Typography & RTL:** `@manovaspace/tokens` provides Estedad (Persian), Inter (Latin), IBM Plex Mono (code), and Vazirmatn (fallback). Persian numerals via `toLocaleDigits`/`persianizeDigits` utilities from `@manovaspace/ui`. Layout respects logical properties (`border-s`, `border-e`, `ps-`, `pe-`).
4. **Badge Variants:** `@manovaspace/ui` Badge supports: `default`, `secondary`, `destructive`, `outline`, `ghost`, `link`. There are no `warning`, `primary`, or `success` variants. For landmark stage colors, use a domain-specific `LandmarkStageBadge` component in `@lighthouse/ui` that applies semantic token classes via `className` overrides on the base `Badge`.
5. **NavTree for Navigation:** Navigation items inside `NavRail` must use the `NavTree` component with `NavItemConfig[]` items — not raw `<Link>` elements. `NavTree` provides active-state highlighting, icon support, subsection nesting, and mobile sheet integration.
6. **Loading States via `loading.tsx`:** Every route group (`(staff)`, `(student)`, `(public)`) must have a `loading.tsx` file that renders `Skeleton` placeholders.

---

## 3. Shell & Layout Architecture

### 3.1 Shell Layout
Both `(staff)` and `(student)` routes share a consistent application shell:
- **`ShellHeader`**:
  - Displays course branding, active route title, and role badge (`owner`, `staff`, or `student`).
  - Contains language selector (`fa` / `en`) and user session profile button.
  - Toggles mobile navigation sheet on narrow screens.
- **`NavRail`**:
  - Responsive desktop sidebar pinned to the start edge (`border-e`).
  - Staff navigation links: Overview, Roster & Invites, Missions & Chapters, Grades, Crews, World & Thresholds, Ship's Log.
  - Student navigation links: Dashboard, Missions, Crew, Harbor Map.

---

## 4. Screen-by-Screen Component Migration

### 4.1 Public & Authentication
- **Login (`/[locale]/login`)**:
  - Encapsulated in `@lighthouse/ui` `Card` with course emblem.
  - `LoginForm` uses `Input`, `Label`, `Button` (with `disabled` and `Spinner` child for loading), and `FieldMessage` for error messages.
- **Invite Activation (`/[locale]/invite/[token]`)**:
  - Rebuilt with `Card`, `Input` (name and password), password validation helper, and `Button`.
- **Harbor Map (`/[locale]/harbor`)**:
  - Retains interactive SVG canvas.
  - Landmark cards and inspection sheets styled with `Card`, `Badge` (stage variants: `dormant`, `under_restoration`, `operational`, `flourishing`), and `Tabs`.

### 4.2 Staff Panel
- **Staff Overview (`/staff`)**:
  - Metric cards using `Card` and `DataValue` displaying enrolled count, active course, accumulated Lumens, and restored landmarks.
- **Roster & Invites (`/staff/roster`)**:
  - `Table` for active students and pending invitations.
  - `InviteForm` rendered as a clean card or dialog with copy-to-clipboard action and toast confirmation.
- **Missions & Chapters (`/staff/missions`)**:
  - Accordion / `Card` lists displaying chapters and associated missions with Lumen limits.
  - `Dialog` modals for adding chapters and creating missions.
- **Grades Grid (`/staff/grades/[missionId]`)**:
  - Score entry grid with numeric validation using Manova `Table` and `Input`.
  - Save Draft and Publish actions.
  - **Publish Safety Guard:** `ConfirmDialog` to confirm live publication of grades.
  - Assessment status indicators (`draft` | `published` | `revised`).
- **Crews (`/staff/crews`)**:
  - Responsive `Card` grid for crew rosters with member assignments.
- **World & Thresholds (`/staff/world`)**:
  - Landmark threshold editor with progress sliders and stage triggers.
- **Ship's Log (`/staff/logs`)**:
  - Chronological feed using `Card` with bilingual Persian/English entries.

### 4.3 Student Dashboard & Views
- **Student Dashboard (`/dashboard`)**:
  - `KeeperRankCard`: Displays current rank with `Progress` indicator towards the next rank.
  - `LumenCounter`: Large numeric display of personal Lumens earned.
  - Active missions list and crew status card.
- **Missions (`/missions`)**:
  - Structured chapter and mission breakdown showing submission status and graded scores.
- **Crew (`/crew`)**:
  - Crew card showing team name, members, and collaborative progress.

---

## 5. Error Handling, Loading States & UX Quality

1. **Three-State Rule**:
   - **Loading State:** Next.js `loading.tsx` and `Skeleton` placeholders prevent layout shifts.
   - **Empty State:** `EmptyState` component used for lists with zero items (e.g. empty roster, no active missions).
   - **Error State:** Descriptive alert messages with retry buttons.
2. **Hydration Safety**:
   - Client-only components or dynamic values (such as local time) wrapped with appropriate hydration protection.
3. **Peer Dependency Resolution**:
   - `@manovaspace/ui`'s root barrel exports `useAppForm` and `Form` which depend on `react-hook-form`, `zod`, and `@hookform/resolvers`. These are marked as optional peer dependencies. To avoid build failures when importing from `@manovaspace/ui`, install them as dependencies of `@lighthouse/ui` (they are lightweight and tree-shaken away if unused).
4. **i18n Key Additions**:
   - New keys needed in `fa.json` and `en.json` for shell chrome: `common.signOut`, `common.language`, `shell.openMenu`, `shell.navigation`.
   - New keys for `ConfirmDialog` publish guard: `staff.grades.publishConfirmTitle`, `staff.grades.publishConfirmDescription`, `staff.grades.publishConfirmButton`.
5. **Root Page Behavior**:
   - `apps/web/src/app/[locale]/page.tsx` currently redirects to `/[locale]/harbor`. This behavior is preserved.

---

## 6. Verification Plan

1. **Monorepo Build & Typecheck**:
   - `bun run typecheck` across all packages (`@lighthouse/web`, `@lighthouse/db`, `@lighthouse/ui`).
2. **Linting & Code Quality**:
   - `bun run lint` (Biome) ensuring strict formatting and lint rules.
3. **Automated Tests**:
   - `bun test` ensuring progression engine tests pass.
4. **Manual Flow Verification**:
   - Login with default credentials (`owner@aput.ir` / `admin123456`).
   - Navigate staff views (`/staff`, `/staff/roster`, `/staff/missions`, `/staff/grades`, `/staff/crews`, `/staff/world`, `/staff/logs`).
   - Create invite, activate account at `/invite/[token]`, sign in as student, verify `/dashboard`, `/missions`, `/crew`, `/harbor`.
   - Toggle between `fa` (RTL) and `en` (LTR).
