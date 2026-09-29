import { AppShell } from "@/components/shell/app-shell";
import { getStaffNavItems } from "@/components/shell/staff-shell-config";
import { UserMenu } from "@/components/shell/user-menu";
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
