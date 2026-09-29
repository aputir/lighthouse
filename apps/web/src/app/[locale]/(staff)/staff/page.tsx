import { courses, enrollments } from "@lighthouse/db";
import { db } from "@lighthouse/db";
import { and, count, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";

export default async function StaffPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("staff");

  // Fetch active course stats
  const [course] = await db.select().from(courses).where(eq(courses.active, true)).limit(1);
  const studentCount = course
    ? await db
        .select({ count: count() })
        .from(enrollments)
        .where(and(eq(enrollments.courseId, course.id), eq(enrollments.active, true)))
    : [{ count: 0 }];

  const countValue = studentCount[0]?.count ?? 0;
  const displayCount = locale === "fa" ? countValue.toLocaleString("fa-IR") : countValue.toString();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("overview")}</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded border p-4">
          <p className="text-sm text-muted-foreground">{t("students")}</p>
          <p className="text-3xl font-bold">{displayCount}</p>
        </div>
      </div>
    </div>
  );
}
