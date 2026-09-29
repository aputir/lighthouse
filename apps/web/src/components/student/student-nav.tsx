import { getTranslations } from "next-intl/server";
import Link from "next/link";

const navItems = [
  { href: "dashboard", key: "dashboard" },
  { href: "missions", key: "missions" },
  { href: "crew", key: "crew" },
  { href: "harbor", key: "harbor" },
] as const;

export async function StudentNav({ locale }: { locale: string }) {
  const t = await getTranslations("student.nav");
  return (
    <nav className="border-b px-6 py-3">
      <ul className="flex gap-6">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={`/${locale}/${item.href}`}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {t(item.key)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
