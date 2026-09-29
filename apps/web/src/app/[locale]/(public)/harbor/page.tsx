import { HarborMap } from "@/components/harbor/harbor-map";
import { courses, db, landmarkStates, shipLogs } from "@lighthouse/db";
import { Badge, EmptyState, Tabs, TabsContent, TabsList, TabsTrigger } from "@lighthouse/ui";
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

  const isFa = locale === "fa";

  return (
    <main className="relative min-h-screen overflow-hidden harbor-world-bg p-6 text-slate-100 md:p-10">
      <header className="relative z-10 mx-auto mb-8 max-w-2xl text-center space-y-2">
        <div className="mb-2 inline-flex items-center justify-center">
          <Badge
            variant="outline"
            className="gap-2 border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-medium text-cyan-300 backdrop-blur-sm shadow-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>{isFa ? "جهان فانوس دریایی · بندرگاه" : "Lighthouse World · Harbor"}</span>
          </Badge>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm font-light text-slate-400 sm:text-base">{t("tagline")}</p>
      </header>

      <Tabs defaultValue="map" className="relative z-10 mx-auto max-w-5xl">
        <div className="mb-8 flex justify-center">
          <TabsList className="bg-slate-900/80 border border-slate-800">
            <TabsTrigger value="map">{isFa ? "نقشه بندرگاه" : "Harbor Map"}</TabsTrigger>
            <TabsTrigger value="logs">
              {t("shipLog")}
              {logs.length > 0 && (
                <Badge variant="secondary" className="ms-2 px-1.5 py-0 text-[10px] tabular-nums">
                  {isFa ? logs.length.toLocaleString("fa-IR") : logs.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="map" className="space-y-10">
          <HarborMap states={states} locale={locale} />
          {logs.length > 0 && (
            <ShipLogFeed logs={logs.slice(0, 3)} locale={locale} title={t("shipLog")} />
          )}
        </TabsContent>

        <TabsContent value="logs" className="mx-auto max-w-2xl">
          {logs.length === 0 ? (
            <EmptyState
              title={t("noLogs")}
              description={
                isFa
                  ? "هنوز گزارشی در دفتر کشتی ثبت نشده است."
                  : "No events recorded in the ship's log yet."
              }
              className="border-slate-800 bg-slate-950/60 text-slate-300"
            />
          ) : (
            <ShipLogFeed logs={logs} locale={locale} title={t("shipLog")} />
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
