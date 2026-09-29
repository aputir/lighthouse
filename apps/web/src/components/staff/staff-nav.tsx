import { getTranslations } from "next-intl/server";
import Link from "next/link";

const navItems = [
  { href: "staff", key: "overview" },
  { href: "staff/roster", key: "roster" },
  { href: "staff/missions", key: "missions" },
  { href: "staff/grades", key: "grades" },
  { href: "staff/crews", key: "crews" },
  { href: "staff/world", key: "world" },
  { href: "staff/logs", key: "logs" },
] as const;

export async function StaffNav({ locale }: { locale: string }) {
  const t = await getTranslations("staff.nav");
  return (
    <nav className="w-56 border-e bg-muted/30 p-4">
      <ul className="space-y-1">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={`/${locale}/${item.href}`}
              className="block rounded px-3 py-2 text-sm hover:bg-muted"
            >
              {t(item.key)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
