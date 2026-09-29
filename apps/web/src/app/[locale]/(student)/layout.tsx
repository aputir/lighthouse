import { StudentNav } from "@/components/student/student-nav";
import { requireRole } from "@/lib/auth-helpers";

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
