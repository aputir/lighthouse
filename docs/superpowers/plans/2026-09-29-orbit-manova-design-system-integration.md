# Orbit / Manova Design System Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate `@manovaspace/ui` and `@manovaspace/tokens` into the Lighthouse monorepo via `packages/ui` (`@lighthouse/ui`) and migrate all public, student, and staff screens to the Manova/Goldstein design system.

**Architecture:** Create `packages/ui` as a thin re-export layer over `@manovaspace/ui` plus Lighthouse domain components. Update `apps/web` theming (globals.css, next.config.ts, layout font migration) to use Manova tokens. Migrate all 21+ screen files from raw HTML/Tailwind to design system primitives. Add shell layout (ShellHeader + NavRail + NavTree + NavMobileSheet) across staff and student route groups.

**Tech Stack:** `@manovaspace/tokens@^0.1.3`, `@manovaspace/ui@^0.3.0` (npm), Next.js 15, Tailwind CSS v4, next-intl, Auth.js v5, Drizzle ORM, Bun, Turborepo, Biome

## Global Constraints

- Zero hardcoded hex colors (`#...`). Only semantic token classes.
- All icons via `@lighthouse/ui/icons` — no direct `lucide-react` or `react-icons` imports.
- Persian primary locale (`fa`). All new UI labels must have both `fa.json` and `en.json` translations.
- Persian numerals in `fa` locale via `toLocaleDigits` / `persianizeDigits` utilities.
- RTL-aware layout: use logical properties (`border-s`, `border-e`, `ps-`, `pe-`).
- `@manovaspace/ui` Badge variants: `default`, `secondary`, `destructive`, `outline`, `ghost`, `link`. No `warning`/`success`/`primary` — use domain component for stage colors.
- Navigation inside `NavRail` must use `NavTree` with `NavItemConfig[]`.
- Every data-dependent UI must handle loading, empty, and error states.
- Biome lint must pass. Typecheck must pass. Existing tests must pass.
- Branch: `feat/orbit-design-system`. No direct push to `main`.

---

### Task 1: Create `packages/ui` Package & Install Dependencies

**Files:**
- Create: `packages/ui/package.json`
- Create: `packages/ui/tsconfig.json`
- Create: `packages/ui/src/index.ts`
- Create: `packages/ui/src/icons.ts`
- Modify: `apps/web/package.json` (add `@lighthouse/ui` workspace dep, remove `@fontsource-variable/estedad`)
- Modify: `apps/web/next.config.ts` (add `transpilePackages`)

**Interfaces:**
- Produces: `@lighthouse/ui` package exporting all `@manovaspace/ui` primitives, composed components, shell components, and utilities. `@lighthouse/ui/icons` re-exporting `@manovaspace/ui/icons`.

- [ ] **Step 1: Create `packages/ui/package.json`**

```json
{
  "name": "@lighthouse/ui",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "sideEffects": false,
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "import": "./src/index.ts"
    },
    "./icons": {
      "types": "./src/icons.ts",
      "import": "./src/icons.ts"
    }
  },
  "dependencies": {
    "@manovaspace/tokens": "^0.1.3",
    "@manovaspace/ui": "^0.3.0",
    "react-hook-form": "^7.81.0",
    "zod": "^3.24.0",
    "@hookform/resolvers": "^5.0.0"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "typescript": "^5.7.2",
    "@types/react": "^19"
  }
}
```

Note: `react-hook-form`, `zod`, and `@hookform/resolvers` are installed to satisfy `@manovaspace/ui`'s optional peer dependencies (its root barrel unconditionally imports `useAppForm` and `Form`).

- [ ] **Step 2: Create `packages/ui/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `packages/ui/src/index.ts`**

This file re-exports all primitives, composed components, shell components, and utilities from `@manovaspace/ui`:

```ts
// ── Primitives ──
export {
  Alert, AlertDescription, AlertTitle, alertVariants,
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
  Avatar, AvatarFallback, AvatarImage,
  Badge, badgeVariants,
  Button, type ButtonProps, buttonVariants,
  Card, CardAction, CardContent, CardDescription, CardFooter,
  CardHeader, type CardProps, CardTitle,
  Checkbox, type CheckboxProps,
  Collapsible, CollapsibleContent, CollapsibleTrigger,
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent,
  DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
  Input, type InputProps,
  Label,
  Popover, PopoverContent, PopoverTrigger,
  Progress,
  ScrollArea, ScrollBar,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter,
  SheetHeader, SheetTitle, SheetTrigger,
  Skeleton,
  Slider,
  Spinner, spinnerVariants,
  Switch, type SwitchProps,
  Table, TableBody, TableCaption, TableCell, TableFooter,
  TableHead, TableHeader, TableRow,
  Tabs, TabsContent, TabsList, TabsTrigger,
  Textarea, type TextareaProps,
  Toast, ToastAction, Toaster, toastVariants,
  Toggle, toggleVariants,
  ToggleGroup, ToggleGroupItem,
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@manovaspace/ui";

// ── Composed ──
export {
  ConfirmDialog, type ConfirmDialogProps,
  DataValue, type DataValueProps, formatDataValue,
  EmptyState, type EmptyStateProps,
  FieldDescription, FieldGroup, FieldMessage, type FieldMessageProps,
  HoldToConfirmButton, type HoldToConfirmButtonProps,
} from "@manovaspace/ui";

// ── Shell ──
export {
  ShellHeader, type ShellHeaderProps, type ShellHeaderVariant, useShellMenuState,
  NavRail, type NavRailProps,
  NavTree, type NavTreeProps, type NavItemConfig, type NavSubsection,
  NavMobileSheet, type NavMobileSheetProps,
} from "@manovaspace/ui";

// ── Utilities ──
export {
  cn, useToast, toast,
  toLocaleDigits, persianizeDigits, formatLocaleInteger,
} from "@manovaspace/ui";

// ── Theme ──
export { ThemeProvider, ThemeSwitcher, useTheme } from "@manovaspace/ui";

// ── Domain components (Lighthouse-specific) ──
export { LandmarkStageBadge } from "./domain/landmark-stage-badge";
```

- [ ] **Step 4: Create `packages/ui/src/icons.ts`**

```ts
export {
  AcademicCapIcon,
  Bars3Icon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClipboardDocumentIcon,
  GlobeAltIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TagIcon,
  TrashIcon,
  UserIcon,
  UsersIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  CalendarIcon,
  Cog6ToothIcon,
  RectangleStackIcon,
  CubeIcon,
  BoltIcon,
  ScaleIcon,
} from "@manovaspace/ui";

export { type IconProps, iconProps } from "@manovaspace/ui";
```

- [ ] **Step 5: Create `packages/ui/src/domain/landmark-stage-badge.tsx`**

```tsx
import { Badge, cn } from "@manovaspace/ui";
import type { ComponentProps } from "react";

const stageStyles: Record<string, string> = {
  dormant: "bg-muted text-muted-foreground",
  under_restoration: "bg-status-warning text-status-warning-foreground",
  operational: "bg-primary text-primary-foreground",
  flourishing: "bg-status-success text-status-success-foreground",
};

export function LandmarkStageBadge({
  stage,
  children,
  className,
  ...props
}: { stage: string } & Omit<ComponentProps<typeof Badge>, "variant">) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent",
        stageStyles[stage] ?? stageStyles.dormant,
        className,
      )}
      {...props}
    >
      {children}
    </Badge>
  );
}
```

- [ ] **Step 6: Add `@lighthouse/ui` to `apps/web/package.json` and remove old font**

In `apps/web/package.json`:
- Add `"@lighthouse/ui": "workspace:*"` to `dependencies`
- Remove `"@fontsource-variable/estedad": "^5.1.1"` from `dependencies`

- [ ] **Step 7: Update `apps/web/next.config.ts` with `transpilePackages`**

```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  transpilePackages: ["@manovaspace/ui", "@manovaspace/tokens", "@lighthouse/ui"],
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 8: Run `bun install` from monorepo root**

Run: `bun install`
Expected: All dependencies resolved including new `@manovaspace/ui`, `@manovaspace/tokens` from npm.

- [ ] **Step 9: Verify typecheck passes for `packages/ui`**

Run: `bun run typecheck`
Expected: Clean typecheck (may have pre-existing warnings in other packages, but `packages/ui` should be clean).

- [ ] **Step 10: Commit**

```bash
git checkout -b feat/orbit-design-system
git add packages/ui/ apps/web/package.json apps/web/next.config.ts
git commit -m "feat(ui): create @lighthouse/ui wrapping @manovaspace/ui and @manovaspace/tokens"
```

---

### Task 2: Theming Layer — globals.css, Layout Font Migration, i18n Shell Keys

**Files:**
- Modify: `apps/web/src/app/globals.css`
- Modify: `apps/web/src/app/[locale]/layout.tsx`
- Modify: `apps/web/messages/fa.json`
- Modify: `apps/web/messages/en.json`

**Interfaces:**
- Consumes: `@manovaspace/tokens/fonts.css`, `@manovaspace/tokens/tokens.css`, `@manovaspace/ui/styles.css` (npm packages installed in Task 1)
- Produces: Fully themed `globals.css` with `@theme inline`, root layout using token fonts, i18n keys for shell chrome

- [ ] **Step 1: Replace `apps/web/src/app/globals.css`**

```css
@import "tailwindcss";
@import "@manovaspace/tokens/fonts.css";
@import "@manovaspace/tokens/tokens.css";
@import "@manovaspace/ui/styles.css";
@import "../components/harbor/harbor.css";

@custom-variant dark (&:is(.dark *));

:root {
  --site-header-height: 4rem;
}

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

- [ ] **Step 2: Update `apps/web/src/app/[locale]/layout.tsx`**

Remove `import "@fontsource-variable/estedad"`. Change body class from `font-estedad` to `font-sans`:

```tsx
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
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
      <body className="font-sans antialiased bg-background text-foreground">
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Add i18n shell keys to `en.json`**

Add under root level:
```json
{
  "common": {
    "signOut": "Sign out",
    "language": "Language"
  },
  "shell": {
    "openMenu": "Open menu",
    "navigation": "Navigation"
  },
  "staff": {
    "grades": {
      "publishConfirmTitle": "Publish grades?",
      "publishConfirmDescription": "Publishing will compute Lumens, update landmark stages, and create Ship's Log entries. This cannot be undone.",
      "publishConfirmButton": "Publish grades"
    }
  }
}
```

(Merge into existing structure — do not replace existing keys.)

- [ ] **Step 4: Add i18n shell keys to `fa.json`**

Add same keys in Persian:
```json
{
  "common": {
    "signOut": "خروج",
    "language": "زبان"
  },
  "shell": {
    "openMenu": "باز کردن منو",
    "navigation": "ناوبری"
  },
  "staff": {
    "grades": {
      "publishConfirmTitle": "انتشار نمرات؟",
      "publishConfirmDescription": "انتشار نمرات باعث محاسبه لومن، به‌روزرسانی مراحل نشانه‌ها و ایجاد ورودی‌های دفتر کشتی می‌شود. این عمل قابل بازگشت نیست.",
      "publishConfirmButton": "انتشار نمرات"
    }
  }
}
```

- [ ] **Step 5: Verify dev server starts**

Run: `bun --filter @lighthouse/web run dev`
Expected: Dev server starts on port 3000 without CSS/font errors. Pages render with Manova token colors.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/globals.css apps/web/src/app/\[locale\]/layout.tsx apps/web/messages/
git commit -m "feat(web): integrate Manova theming layer — tokens, fonts, globals.css, i18n shell keys"
```

---

### Task 3: Shell Layout — ShellHeader, NavRail, NavTree for Staff & Student

**Files:**
- Create: `apps/web/src/components/shell/app-shell.tsx`
- Create: `apps/web/src/components/shell/staff-shell-config.ts`
- Create: `apps/web/src/components/shell/student-shell-config.ts`
- Create: `apps/web/src/components/shell/user-menu.tsx`
- Modify: `apps/web/src/app/[locale]/(staff)/staff/layout.tsx`
- Modify: `apps/web/src/app/[locale]/(student)/layout.tsx`
- Delete (or keep as fallback): `apps/web/src/components/staff/staff-nav.tsx`
- Delete (or keep as fallback): `apps/web/src/components/student/student-nav.tsx`

**Interfaces:**
- Consumes: `ShellHeader`, `NavRail`, `NavTree`, `NavMobileSheet`, `useShellMenuState`, `NavItemConfig`, `Button`, `Avatar`, `DropdownMenu*` from `@lighthouse/ui`. i18n keys from Task 2. `auth()` / `signOut` from `@/lib/auth`.
- Produces: `<AppShell>` client component rendering ShellHeader + NavRail + NavMobileSheet + main content area. `staffNavItems` and `studentNavItems` config arrays.

- [ ] **Step 1: Create `apps/web/src/components/shell/staff-shell-config.ts`**

```ts
import type { NavItemConfig } from "@lighthouse/ui";

export function getStaffNavItems(locale: string, t: (key: string) => string): NavItemConfig[] {
  return [
    { href: `/${locale}/staff`, label: t("staff.nav.overview") },
    { href: `/${locale}/staff/roster`, label: t("staff.nav.roster") },
    { href: `/${locale}/staff/missions`, label: t("staff.nav.missions") },
    { href: `/${locale}/staff/grades`, label: t("staff.nav.grades") },
    { href: `/${locale}/staff/crews`, label: t("staff.nav.crews") },
    { href: `/${locale}/staff/world`, label: t("staff.nav.world") },
    { href: `/${locale}/staff/logs`, label: t("staff.nav.logs") },
  ];
}
```

- [ ] **Step 2: Create `apps/web/src/components/shell/student-shell-config.ts`**

```ts
import type { NavItemConfig } from "@lighthouse/ui";

export function getStudentNavItems(locale: string, t: (key: string) => string): NavItemConfig[] {
  return [
    { href: `/${locale}/dashboard`, label: t("student.nav.dashboard") },
    { href: `/${locale}/missions`, label: t("student.nav.missions") },
    { href: `/${locale}/crew`, label: t("student.nav.crew") },
    { href: `/${locale}/harbor`, label: t("student.nav.harbor") },
  ];
}
```

- [ ] **Step 3: Create `apps/web/src/components/shell/user-menu.tsx`**

Client component providing user avatar dropdown with sign-out and language toggle:

```tsx
"use client";

import {
  Avatar, AvatarFallback,
  Button,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@lighthouse/ui";
import { signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function UserMenu({ userName }: { userName: string }) {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const otherLocale = locale === "fa" ? "en" : "fa";
  const switchedPath = pathname.replace(`/${locale}`, `/${otherLocale}`);
  const initials = userName.slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="size-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={switchedPath}>
            {t("common.language")}: {otherLocale === "fa" ? "فارسی" : "English"}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: `/${locale}/login` })}>
          {t("common.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

- [ ] **Step 4: Create `apps/web/src/components/shell/app-shell.tsx`**

Client component that combines ShellHeader, NavRail, NavMobileSheet, NavTree:

```tsx
"use client";

import {
  NavMobileSheet, NavRail, NavTree,
  ShellHeader, useShellMenuState,
  type NavItemConfig,
} from "@lighthouse/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function AppShell({
  title,
  label,
  navItems,
  openMenuLabel,
  navigationLabel,
  userMenu,
  children,
}: {
  title: string;
  label?: string;
  navItems: NavItemConfig[];
  openMenuLabel: string;
  navigationLabel: string;
  userMenu: ReactNode;
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useShellMenuState();
  const pathname = usePathname();
  const menuSheetId = "mobile-nav-sheet";

  return (
    <div className="flex min-h-screen flex-col">
      <ShellHeader
        title={title}
        label={label}
        openMenuLabel={openMenuLabel}
        menuOpen={menuOpen}
        onMenuOpenChange={setMenuOpen}
        menuSheetId={menuSheetId}
        headerActions={userMenu}
        menuSheet={
          <NavMobileSheet
            id={menuSheetId}
            open={menuOpen}
            onOpenChange={setMenuOpen}
            title={navigationLabel}
          >
            <NavTree
              items={navItems}
              currentPath={pathname}
              onNavigate={() => setMenuOpen(false)}
              asLink={Link}
            />
          </NavMobileSheet>
        }
      />
      <div className="flex min-h-0 flex-1">
        <NavRail>
          <NavTree items={navItems} currentPath={pathname} asLink={Link} />
        </NavRail>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Update staff layout**

Replace `apps/web/src/app/[locale]/(staff)/staff/layout.tsx`:

```tsx
import { AppShell } from "@/components/shell/app-shell";
import { UserMenu } from "@/components/shell/user-menu";
import { getStaffNavItems } from "@/components/shell/staff-shell-config";
import { requireRole } from "@/lib/auth-helpers";
import { getTranslations } from "next-intl/server";

export default async function StaffLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireRole("staff", locale);
  const t = await getTranslations();
  const navItems = getStaffNavItems(locale, t);

  return (
    <AppShell
      title={t("app.name")}
      label={t("app.tagline")}
      navItems={navItems}
      openMenuLabel={t("shell.openMenu")}
      navigationLabel={t("shell.navigation")}
      userMenu={<UserMenu userName={user.name ?? user.email ?? "?"} />}
    >
      {children}
    </AppShell>
  );
}
```

- [ ] **Step 6: Update student layout**

Replace `apps/web/src/app/[locale]/(student)/layout.tsx`:

```tsx
import { AppShell } from "@/components/shell/app-shell";
import { UserMenu } from "@/components/shell/user-menu";
import { getStudentNavItems } from "@/components/shell/student-shell-config";
import { requireRole } from "@/lib/auth-helpers";
import { getTranslations } from "next-intl/server";

export default async function StudentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireRole("student", locale);
  const t = await getTranslations();
  const navItems = getStudentNavItems(locale, t);

  return (
    <AppShell
      title={t("app.name")}
      label={t("app.tagline")}
      navItems={navItems}
      openMenuLabel={t("shell.openMenu")}
      navigationLabel={t("shell.navigation")}
      userMenu={<UserMenu userName={user.name ?? user.email ?? "?"} />}
    >
      {children}
    </AppShell>
  );
}
```

- [ ] **Step 7: Verify staff and student shells render correctly**

Run: `bun --filter @lighthouse/web run dev`
Navigate to `/fa/staff` (logged in as owner) and `/fa/dashboard` (logged in as student).
Expected: ShellHeader at top, NavRail sidebar on desktop, NavMobileSheet on mobile.

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/components/shell/ apps/web/src/app/\[locale\]/
git commit -m "feat(web): add AppShell layout with ShellHeader, NavRail, NavTree for staff & student"
```

---

### Task 4: Public Screens Migration — Login, Invite, Harbor

**Files:**
- Modify: `apps/web/src/app/[locale]/(public)/login/login-form.tsx`
- Modify: `apps/web/src/app/[locale]/(public)/login/page.tsx`
- Modify: `apps/web/src/app/[locale]/(public)/invite/[token]/activate-form.tsx`
- Modify: `apps/web/src/app/[locale]/(public)/invite/[token]/page.tsx`
- Modify: `apps/web/src/app/[locale]/(public)/harbor/page.tsx`
- Modify: `apps/web/src/app/[locale]/(public)/harbor/ship-log-feed.tsx`
- Modify: `apps/web/src/components/harbor/landmark-card.tsx`
- Modify: `apps/web/src/components/harbor/landmark-badge.tsx`

**Interfaces:**
- Consumes: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Input`, `Label`, `Button`, `Spinner`, `FieldMessage`, `Badge`, `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger`, `Skeleton`, `EmptyState` from `@lighthouse/ui`. `LandmarkStageBadge` from `@lighthouse/ui`. i18n keys from existing `fa.json`/`en.json`.
- Produces: Migrated public screens using design system components.

- [ ] **Step 1: Migrate `login-form.tsx`**

Replace raw HTML inputs/buttons with `@lighthouse/ui` components:

```tsx
"use client";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, FieldMessage, Input, Label, Spinner } from "@lighthouse/ui";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function LoginForm({ locale }: { locale: string }) {
  const t = useTranslations("auth");
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
      setError(t("invalidCredentials"));
      setLoading(false);
    } else {
      window.location.href = `/${locale}/dashboard`;
    }
  }

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle>{t("signIn")}</CardTitle>
        <CardDescription>{/* tagline if desired */}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {error && <FieldMessage variant="error">{error}</FieldMessage>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Spinner className="size-4" /> : t("signIn")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Update login `page.tsx`**

Update to center the card on a clean background:

```tsx
import { LoginForm } from "./login-form";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-sunken p-4">
      <LoginForm locale={locale} />
    </div>
  );
}
```

- [ ] **Step 3: Migrate `activate-form.tsx`**

Replace raw HTML with `Card`, `Input`, `Label`, `Button`, `FieldMessage` from `@lighthouse/ui`.

- [ ] **Step 4: Migrate invite `page.tsx`**

Wrap in centered card layout similar to login.

- [ ] **Step 5: Migrate `landmark-badge.tsx`**

Replace with `LandmarkStageBadge` from `@lighthouse/ui`:

```tsx
import { LandmarkStageBadge } from "@lighthouse/ui";

export function LandmarkBadge({ stage, label }: { stage: string; label: string }) {
  return <LandmarkStageBadge stage={stage}>{label}</LandmarkStageBadge>;
}
```

- [ ] **Step 6: Migrate `landmark-card.tsx`**

Replace raw divs with `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Progress` from `@lighthouse/ui`.

- [ ] **Step 7: Migrate harbor `page.tsx` and `ship-log-feed.tsx`**

Replace raw HTML with `Card`, `Tabs`, `EmptyState`, `Badge` from `@lighthouse/ui`.

- [ ] **Step 8: Verify all public pages render correctly**

Navigate to `/fa/login`, `/fa/harbor`. Verify cards render with proper token colors, RTL layout, no unstyled elements.

- [ ] **Step 9: Run tests**

Run: `bun test`
Expected: Existing harbor tests pass.

- [ ] **Step 10: Commit**

```bash
git add apps/web/src/app/\[locale\]/\(public\)/ apps/web/src/components/harbor/ packages/ui/src/domain/
git commit -m "feat(web): migrate public screens (login, invite, harbor) to Manova design system"
```

---

### Task 5: Staff Screens Migration

**Files:**
- Modify: `apps/web/src/app/[locale]/(staff)/staff/page.tsx`
- Modify: `apps/web/src/app/[locale]/(staff)/staff/roster/page.tsx`
- Modify: `apps/web/src/app/[locale]/(staff)/staff/roster/invite-form.tsx`
- Modify: `apps/web/src/app/[locale]/(staff)/staff/missions/page.tsx`
- Modify: `apps/web/src/app/[locale]/(staff)/staff/missions/add-chapter-form.tsx`
- Modify: `apps/web/src/app/[locale]/(staff)/staff/missions/add-mission-form.tsx`
- Modify: `apps/web/src/app/[locale]/(staff)/staff/grades/page.tsx`
- Modify: `apps/web/src/app/[locale]/(staff)/staff/grades/[missionId]/page.tsx`
- Modify: `apps/web/src/app/[locale]/(staff)/staff/grades/[missionId]/grade-grid.tsx`
- Modify: `apps/web/src/app/[locale]/(staff)/staff/crews/page.tsx`
- Modify: `apps/web/src/app/[locale]/(staff)/staff/crews/add-crew-form.tsx`
- Modify: `apps/web/src/app/[locale]/(staff)/staff/crews/add-member-form.tsx`
- Modify: `apps/web/src/app/[locale]/(staff)/staff/world/page.tsx`
- Modify: `apps/web/src/app/[locale]/(staff)/staff/logs/page.tsx`

**Interfaces:**
- Consumes: All primitives, composed components, and domain components from `@lighthouse/ui`. i18n keys. Data queries from existing `queries.ts` files. Server actions from existing `actions.ts` files.
- Produces: Migrated staff screens using design system components throughout.

- [ ] **Step 1: Migrate staff overview page**

Replace raw HTML in `staff/page.tsx` with `Card`, `CardHeader`, `CardTitle`, `CardContent`, `DataValue` for metric display, `EmptyState` for no-course state.

- [ ] **Step 2: Migrate roster page and invite form**

Replace raw `<table>` with `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell`. Replace `<form>` in `invite-form.tsx` with `Card`, `Input`, `Label`, `Button`, `Spinner`. Add `useToast` + `toast()` for copy-to-clipboard feedback.

- [ ] **Step 3: Migrate missions page and forms**

Replace raw HTML with `Card`, `Collapsible`, `CollapsibleContent`, `CollapsibleTrigger` for chapter accordion. Replace add-chapter and add-mission forms with `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `Input`, `Label`, `Button`.

- [ ] **Step 4: Migrate grades pages and grade grid**

Replace raw `<table>` in grade-grid.tsx with `Table` components and `Input` for score entry. Replace publish button with `ConfirmDialog` wrapping a `Button`:

```tsx
<ConfirmDialog
  title={t("staff.grades.publishConfirmTitle")}
  description={t("staff.grades.publishConfirmDescription")}
  confirmLabel={t("staff.grades.publishConfirmButton")}
  onConfirm={handlePublish}
>
  <Button>{t("staff.grades.publishButton", { count: draftCount })}</Button>
</ConfirmDialog>
```

Add `Badge` with appropriate variant for assessment state indicators (`draft` → `secondary`, `published` → `default`, `revised` → `outline`).

- [ ] **Step 5: Migrate crews page and forms**

Replace raw HTML with `Card` grid for crew display, `Dialog` for add-crew, `Select` for student assignment.

- [ ] **Step 6: Migrate world page**

Replace raw HTML with `Card`, `Progress`, `LandmarkStageBadge`, `DataValue` for threshold display.

- [ ] **Step 7: Migrate logs page**

Replace raw HTML with `Card` feed for ship log entries, `EmptyState` for no-logs state.

- [ ] **Step 8: Verify all staff pages render correctly**

Navigate through all `/fa/staff/*` routes. Verify tables, forms, dialogs, cards, and badges render with token colors.

- [ ] **Step 9: Run tests**

Run: `bun test`
Expected: All existing tests pass.

- [ ] **Step 10: Commit**

```bash
git add apps/web/src/app/\[locale\]/\(staff\)/
git commit -m "feat(web): migrate all staff screens to Manova design system"
```

---

### Task 6: Student Screens Migration

**Files:**
- Modify: `apps/web/src/app/[locale]/(student)/dashboard/page.tsx`
- Modify: `apps/web/src/app/[locale]/(student)/missions/page.tsx`
- Modify: `apps/web/src/app/[locale]/(student)/crew/page.tsx`

**Interfaces:**
- Consumes: `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Progress`, `Badge`, `DataValue`, `EmptyState`, `LandmarkStageBadge`, `formatLocaleInteger`, `toLocaleDigits` from `@lighthouse/ui`. i18n keys. Data from `@/lib/student-data.ts`.
- Produces: Migrated student screens.

- [ ] **Step 1: Migrate student dashboard**

Replace raw HTML with:
- `Card` + `CardHeader` + `DataValue` for Lumen counter
- `Card` + `Progress` for Keeper Rank progress
- `Card` for active missions teaser
- `EmptyState` for no-course state
- Use `formatLocaleInteger` for Persian numeral display in `fa` locale

- [ ] **Step 2: Migrate missions page**

Replace raw HTML with `Card` per chapter, `Badge` for mission status, `EmptyState` for no-missions.

- [ ] **Step 3: Migrate crew page**

Replace raw HTML with `Card` for crew info, `Avatar` + `AvatarFallback` for member avatars, `EmptyState` for no-crew.

- [ ] **Step 4: Verify all student pages render correctly**

Navigate to `/fa/dashboard`, `/fa/missions`, `/fa/crew` as a student user.

- [ ] **Step 5: Run tests**

Run: `bun test`
Expected: All student-data tests pass.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/\[locale\]/\(student\)/
git commit -m "feat(web): migrate all student screens to Manova design system"
```

---

### Task 7: Loading States, Cleanup, and Final Verification

**Files:**
- Create: `apps/web/src/app/[locale]/(staff)/staff/loading.tsx`
- Create: `apps/web/src/app/[locale]/(student)/loading.tsx`
- Create: `apps/web/src/app/[locale]/(public)/login/loading.tsx`
- Create: `apps/web/src/app/[locale]/(public)/harbor/loading.tsx`
- Delete: `apps/web/src/components/staff/staff-nav.tsx`
- Delete: `apps/web/src/components/student/student-nav.tsx`

**Interfaces:**
- Consumes: `Skeleton`, `Card` from `@lighthouse/ui`
- Produces: Route-level loading states, clean codebase with no dead nav components

- [ ] **Step 1: Create staff loading skeleton**

```tsx
// apps/web/src/app/[locale]/(staff)/staff/loading.tsx
import { Card, Skeleton } from "@lighthouse/ui";

export default function StaffLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="h-6 w-16" />
          </Card>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create student loading skeleton**

Similar skeleton pattern for student routes.

- [ ] **Step 3: Create public loading skeletons**

Login and harbor loading states with centered card skeletons.

- [ ] **Step 4: Delete old nav components**

Remove `apps/web/src/components/staff/staff-nav.tsx` and `apps/web/src/components/student/student-nav.tsx`.

- [ ] **Step 5: Update WORKSPACE_INDEX.md**

Update `packages.ui` entry:
```markdown
## [packages.ui]
- **Aliases**: ui, components, design-system, shadcn, manova, orbit
- **Path**: `packages/ui/`
- **Package**: `@lighthouse/ui`
- **Short**: Thin re-export wrapper over `@manovaspace/ui` + `@manovaspace/tokens` with Lighthouse domain components.
- **Card**:
  Re-exports all primitives, composed components (EmptyState, ConfirmDialog, DataValue, Shell),
  and utilities from `@manovaspace/ui@0.3.0`.
  Adds domain components: LandmarkStageBadge.
  Lighthouse-specific theming via globals.css `@theme inline` binding.
  Stack: @manovaspace/ui, @manovaspace/tokens, React 19, Tailwind CSS v4.
```

- [ ] **Step 6: Full monorepo typecheck**

Run: `bun run typecheck`
Expected: Clean across all packages.

- [ ] **Step 7: Full lint check**

Run: `bun run lint`
Expected: Biome passes with no errors.

- [ ] **Step 8: Full test suite**

Run: `bun test`
Expected: All existing tests pass (progression, harbor, student-data).

- [ ] **Step 9: Manual smoke test**

1. Login at `/fa/login` with `owner@aput.ir` / `admin123456`
2. Navigate all staff routes: overview, roster, missions, grades, crews, world, logs
3. Create an invite at `/fa/staff/roster`
4. Open invite link in incognito, activate account
5. Login as student, navigate dashboard, missions, crew
6. Visit `/fa/harbor` (public)
7. Toggle to `/en/` and verify English layout (LTR)
8. Verify mobile responsiveness (ShellHeader hamburger → NavMobileSheet)

- [ ] **Step 10: Commit and push**

```bash
git add -A
git commit -m "feat(web): loading skeletons, cleanup old navs, update WORKSPACE_INDEX"
git push origin feat/orbit-design-system
```
