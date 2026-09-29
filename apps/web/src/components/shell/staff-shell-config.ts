import type { NavItemConfig } from "@lighthouse/ui";

export function getStaffNavItems(locale: string, t: (key: string) => string): NavItemConfig[] {
  return [
    { href: `/${locale}/staff`, label: t("staff.nav.overview"), exact: true },
    { href: `/${locale}/staff/roster`, label: t("staff.nav.roster") },
    { href: `/${locale}/staff/missions`, label: t("staff.nav.missions") },
    { href: `/${locale}/staff/grades`, label: t("staff.nav.grades") },
    { href: `/${locale}/staff/crews`, label: t("staff.nav.crews") },
    { href: `/${locale}/staff/world`, label: t("staff.nav.world") },
    { href: `/${locale}/staff/logs`, label: t("staff.nav.logs") },
  ];
}
