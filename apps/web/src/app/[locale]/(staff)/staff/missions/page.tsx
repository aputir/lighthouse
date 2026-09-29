import {
  Card,
  CardContent,
  CardHeader,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DataValue,
  EmptyState,
} from "@lighthouse/ui";
import { getTranslations } from "next-intl/server";
import { AddChapterForm } from "./add-chapter-form";
import { AddMissionForm } from "./add-mission-form";
import { getActiveCourse, getChaptersWithMissions } from "./queries";

export default async function MissionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("staff.missions");
  const course = await getActiveCourse();

  if (!course) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <EmptyState title={t("noActiveCourse")} />
      </div>
    );
  }

  const chaptersWithMissions = await getChaptersWithMissions(course.id);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <AddChapterForm order={chaptersWithMissions.length + 1} />
      </div>

      {chaptersWithMissions.length === 0 ? (
        <EmptyState title={t("noMissions")} action={<AddChapterForm order={1} />} />
      ) : (
        <div className="space-y-4">
          {chaptersWithMissions.map((ch) => {
            const chapterTitle = locale === "fa" ? ch.titleFa : ch.title;

            return (
              <Card key={ch.id}>
                <Collapsible defaultOpen>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CollapsibleTrigger asChild>
                      <button
                        type="button"
                        className="flex flex-1 items-center justify-between text-start font-semibold transition hover:opacity-80"
                      >
                        <span className="text-base">
                          <DataValue value={ch.order} locale={locale} />. {chapterTitle}
                        </span>
                        {ch.missions.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            (<DataValue value={ch.missions.length} locale={locale} />)
                          </span>
                        )}
                      </button>
                    </CollapsibleTrigger>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent className="space-y-4 pt-0">
                      {ch.missions.length === 0 ? (
                        <p className="text-xs text-muted-foreground">{t("noMissions")}</p>
                      ) : (
                        <ul className="space-y-2">
                          {ch.missions.map((m) => {
                            const missionTitle = locale === "fa" ? m.titleFa : m.title;

                            return (
                              <li
                                key={m.id}
                                className="flex items-center justify-between rounded-md border border-border/50 bg-muted/20 px-3 py-2 text-sm"
                              >
                                <span className="font-medium">
                                  <DataValue value={m.order} locale={locale} />. {missionTitle}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  <DataValue value={m.maxLumens} locale={locale} /> {t("lumens")}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                      <div className="pt-2">
                        <AddMissionForm chapterId={ch.id} order={ch.missions.length + 1} />
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
