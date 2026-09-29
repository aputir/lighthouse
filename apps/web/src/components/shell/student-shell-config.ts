import type { NavItemConfig } from "@lighthouse/ui";

export function getStudentNavItems(locale: string, t: (key: string) => string): NavItemConfig[] {
  return [
    { href: `/${locale}/dashboard`, label: t("student.nav.dashboard") },
    { href: `/${locale}/missions`, label: t("student.nav.missions") },
    { href: `/${locale}/crew`, label: t("student.nav.crew") },
    { href: `/${locale}/harbor`, label: t("student.nav.harbor") },
  ];
}
