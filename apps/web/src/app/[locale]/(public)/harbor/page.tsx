import { HarborMap } from "@/components/harbor/harbor-map";
import { courses, db, landmarkStates, shipLogs } from "@lighthouse/db";
import { desc, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { ShipLogFeed } from "./ship-log-feed";

export default async function PublicHarborPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("harbor");
  const [course] = await db.select().from(courses).where(eq(courses.active, true)).limit(1);

  const states = course
    ? await db.select().from(landmarkStates).where(eq(landmarkStates.courseId, course.id))
    : [];

  const logs = course
    ? await db
        .select()
        .from(shipLogs)
        .where(eq(shipLogs.courseId, course.id))
        .orderBy(desc(shipLogs.triggeredAt))
        .limit(5)
    : [];

  return (
    <main className="min-h-screen p-6">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("tagline")}</p>
      </header>
      <HarborMap states={states} locale={locale} />
      <ShipLogFeed logs={logs} locale={locale} title={t("shipLog")} />
    </main>
  );
}
