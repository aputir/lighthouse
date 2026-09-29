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

  let states: (typeof landmarkStates.$inferSelect)[] = [];
  let logs: (typeof shipLogs.$inferSelect)[] = [];

  try {
    const [course] = await db.select().from(courses).where(eq(courses.active, true)).limit(1);

    if (course) {
      states = await db.select().from(landmarkStates).where(eq(landmarkStates.courseId, course.id));

      logs = await db
        .select()
        .from(shipLogs)
        .where(eq(shipLogs.courseId, course.id))
        .orderBy(desc(shipLogs.triggeredAt))
        .limit(5);
    }
  } catch (error) {
    console.error("PublicHarborPage: Database query failed, rendering default world state:", error);
  }

  return (
    <main className="min-h-screen harbor-world-bg text-slate-100 p-6 md:p-10 relative overflow-hidden">
      <header className="mb-10 text-center relative z-10 max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-medium text-cyan-300 backdrop-blur-sm mb-1 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>
            {locale === "fa" ? "جهان فانوس دریایی · بندرگاه" : "Lighthouse World · Harbor"}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
          {t("title")}
        </h1>
        <p className="mt-1 text-slate-400 text-sm sm:text-base font-light">{t("tagline")}</p>
      </header>

      <div className="relative z-10">
        <HarborMap states={states} locale={locale} />
      </div>

      <ShipLogFeed logs={logs} locale={locale} title={t("shipLog")} />
    </main>
  );
}
