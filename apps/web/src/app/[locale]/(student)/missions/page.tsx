import { auth } from "@/lib/auth";
import { getStudentProgress } from "@/lib/student-data";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  formatLocaleInteger,
} from "@lighthouse/ui";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

const STATE_KEYS: Record<string, string> = {
  draft: "states.underReview",
  published: "states.assessed",
  revised: "states.revised",
  awaiting: "states.awaiting",
};

function getMissionBadge(stateKey: string, label: string) {
  switch (stateKey) {
    case "draft":
      return <Badge variant="secondary">{label}</Badge>;
    case "published":
      return <Badge variant="default">{label}</Badge>;
    case "revised":
      return <Badge variant="outline">{label}</Badge>;
    default:
      return (
        <Badge variant="outline" className="text-muted-foreground">
          {label}
        </Badge>
      );
  }
}

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

  if (!progress) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <EmptyState title={t("noCourse")} />
      </div>
    );
  }

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
        <EmptyState title={t("noMissions")} />
      ) : (
        <div className="space-y-6">
          {[...byChapter.values()].map((missionGroup) => {
            const first = missionGroup[0];
            if (!first) return null;
            const chapter = first.chapter;
            return (
              <Card key={chapter.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold">
                    {formatLocaleInteger(chapter.order, locale)}.{" "}
                    {isFa ? chapter.titleFa : chapter.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y divide-border">
                    {missionGroup.map(({ mission, assessment }) => {
                      const stateKey = assessment?.state ?? "awaiting";
                      const badgeLabelKey = STATE_KEYS[stateKey] ?? STATE_KEYS.awaiting;
                      return (
                        <li
                          key={mission.id}
                          className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                        >
                          <div className="space-y-1">
                            <p className="font-medium text-sm sm:text-base">
                              {formatLocaleInteger(mission.order, locale)}.{" "}
                              {isFa ? mission.titleFa : mission.title}
                            </p>
                            <div>{getMissionBadge(stateKey, t(badgeLabelKey))}</div>
                          </div>
                          {assessment?.lumens !== null && assessment?.lumens !== undefined && (
                            <span className="text-sm font-semibold tabular-nums">
                              {formatLocaleInteger(assessment.lumens, locale)} {t("lumenShort")}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
