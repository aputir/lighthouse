import { getTranslations } from "next-intl/server";
import { getActiveCourse, getChaptersWithMissions } from "./actions";
import { AddChapterForm } from "./add-chapter-form";
import { AddMissionForm } from "./add-mission-form";

export default async function MissionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("staff.missions");
  const course = await getActiveCourse();
  const chaptersWithMissions = course ? await getChaptersWithMissions(course.id) : [];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      {!course && <p className="text-muted-foreground">{t("noActiveCourse")}</p>}

      {chaptersWithMissions.map((ch) => {
        const chapterOrderDisplay =
          locale === "fa" ? ch.order.toLocaleString("fa-IR") : ch.order.toString();
        const chapterTitle = locale === "fa" ? ch.titleFa : ch.title;

        return (
          <div key={ch.id} className="rounded border p-4">
            <h2 className="font-semibold">
              {chapterOrderDisplay}. {chapterTitle}
            </h2>
            {ch.missions.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground ps-4">{t("noMissions")}</p>
            ) : (
              <ul className="mt-2 space-y-1 ps-4">
                {ch.missions.map((m) => {
                  const missionOrderDisplay =
                    locale === "fa" ? m.order.toLocaleString("fa-IR") : m.order.toString();
                  const missionTitle = locale === "fa" ? m.titleFa : m.title;
                  const maxLumensDisplay =
                    locale === "fa" ? m.maxLumens.toLocaleString("fa-IR") : m.maxLumens.toString();

                  return (
                    <li key={m.id} className="text-sm">
                      {missionOrderDisplay}. {missionTitle} — {maxLumensDisplay} {t("lumens")}
                    </li>
                  );
                })}
              </ul>
            )}
            <AddMissionForm chapterId={ch.id} order={ch.missions.length + 1} />
          </div>
        );
      })}

      <div className="rounded border p-4">
        <h2 className="font-semibold">{t("addChapter")}</h2>
        <AddChapterForm order={chaptersWithMissions.length + 1} />
      </div>
    </div>
  );
}
