import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataValue,
  EmptyState,
  formatLocaleInteger,
} from "@lighthouse/ui";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getGradesOverview } from "./queries";

export default async function GradesListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("staff.grades");

  const data = await getGradesOverview();
  if (!data) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <EmptyState title={t("noActiveCourse")} />
      </div>
    );
  }

  const { chapters, missions, draftMap } = data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      {chapters.length === 0 ? (
        <EmptyState title={t("noMissions")} />
      ) : (
        chapters.map((ch) => {
          const chapterMissions = missions.filter((m) => m.chapterId === ch.id);
          const chapterTitle = locale === "fa" ? ch.titleFa : ch.title;

          return (
            <Card key={ch.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  <DataValue value={ch.order} locale={locale} />. {chapterTitle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chapterMissions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">{t("noMissions")}</p>
                ) : (
                  <ul className="space-y-2">
                    {chapterMissions.map((m) => {
                      const drafts = draftMap.get(m.id) ?? 0;
                      const missionTitle = locale === "fa" ? m.titleFa : m.title;

                      return (
                        <li key={m.id}>
                          <Link
                            href={`/${locale}/staff/grades/${m.id}`}
                            className="inline-flex items-center gap-2 text-sm font-medium transition hover:underline"
                          >
                            <span>{missionTitle}</span>
                            <span className="text-xs text-muted-foreground">
                              (<DataValue value={m.maxLumens} locale={locale} /> {t("lumens")})
                            </span>
                            {drafts > 0 && (
                              <Badge variant="secondary">
                                {t("drafts", { count: formatLocaleInteger(drafts, locale) })}
                              </Badge>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
