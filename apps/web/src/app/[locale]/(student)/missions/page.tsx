import { auth } from "@/lib/auth";
import { getStudentProgress } from "@/lib/student-data";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

const STATE_STYLES: Record<string, string> = {
  draft: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  published: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  revised: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  awaiting: "bg-muted text-muted-foreground",
};

const STATE_KEYS: Record<string, string> = {
  draft: "states.underReview",
  published: "states.assessed",
  revised: "states.revised",
  awaiting: "states.awaiting",
};

export default async function MissionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isFa = locale === "fa";
  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const t = await getTranslations("student.missions");
  const progress = await getStudentProgress(session.user.id);

  if (!progress) return <p className="text-muted-foreground">{t("noCourse")}</p>;

  // Group by chapter
  const byChapter = new Map<string, typeof progress.missions>();
  for (const m of progress.missions) {
    const key = m.chapter.id;
    const existing = byChapter.get(key);
    if (existing) {
      existing.push(m);
    } else {
      byChapter.set(key, [m]);
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      {byChapter.size === 0 ? (
        <p className="text-muted-foreground">{t("noMissions")}</p>
      ) : (
        [...byChapter.values()].map((missionGroup) => {
          const first = missionGroup[0];
          if (!first) return null;
          const chapter = first.chapter;
          return (
            <div key={chapter.id}>
              <h2 className="mb-3 font-semibold">
                {isFa ? chapter.order.toLocaleString("fa-IR") : chapter.order}.{" "}
                {isFa ? chapter.titleFa : chapter.title}
              </h2>
              <ul className="space-y-2 ps-4">
                {missionGroup.map(({ mission, assessment }) => {
                  const stateKey = assessment?.state ?? "awaiting";
                  const badgeStyle = STATE_STYLES[stateKey] ?? STATE_STYLES.awaiting;
                  const badgeLabelKey = STATE_KEYS[stateKey] ?? STATE_KEYS.awaiting;
                  return (
                    <li
                      key={mission.id}
                      className="flex items-center justify-between rounded border p-3"
                    >
                      <div>
                        <p className="font-medium">
                          {isFa ? mission.order.toLocaleString("fa-IR") : mission.order}.{" "}
                          {isFa ? mission.titleFa : mission.title}
                        </p>
                        <span
                          className={`mt-1 inline-block rounded px-2 py-0.5 text-xs font-medium ${badgeStyle}`}
                        >
                          {t(badgeLabelKey)}
                        </span>
                      </div>
                      {assessment?.lumens !== null && assessment?.lumens !== undefined && (
                        <span className="text-sm font-semibold">
                          {isFa ? assessment.lumens.toLocaleString("fa-IR") : assessment.lumens}{" "}
                          {t("lumenShort")}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })
      )}
    </div>
  );
}
