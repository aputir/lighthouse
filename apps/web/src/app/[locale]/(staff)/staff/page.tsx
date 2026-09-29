import { courses, db, enrollments } from "@lighthouse/db";
import { Card, CardContent, CardHeader, CardTitle, DataValue, EmptyState } from "@lighthouse/ui";
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

  if (!course) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("overview")}</h1>
        <EmptyState title={t("noActiveCourse")} />
      </div>
    );
  }

  const studentCount = await db
    .select({ count: count() })
    .from(enrollments)
    .where(and(eq(enrollments.courseId, course.id), eq(enrollments.active, true)));

  const countValue = studentCount[0]?.count ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("overview")}</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("students")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              <DataValue value={countValue} locale={locale} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
