import { StaffNav } from "@/components/staff/staff-nav";
import { requireRole } from "@/lib/auth-helpers";

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
