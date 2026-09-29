import { auth } from "@/lib/auth";
import { KEEPER_RANKS, getStudentProgress } from "@/lib/student-data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataValue,
  EmptyState,
  Progress,
  formatLocaleInteger,
} from "@lighthouse/ui";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const isFa = locale === "fa";
  const t = await getTranslations("student.dashboard");

  const progress = await getStudentProgress(session.user.id);

  if (!progress) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <EmptyState title={t("noCourse")} />
      </div>
    );
  }

  const currentRankIndex = KEEPER_RANKS.findIndex((r) => r.key === progress.rank.key);
  const nextRank =
    currentRankIndex >= 0 && currentRankIndex < KEEPER_RANKS.length - 1
      ? KEEPER_RANKS[currentRankIndex + 1]
      : null;

  const rankProgressPercent = nextRank
    ? Math.min(
        100,
        Math.max(
          0,
          Math.round(
            ((progress.totalLumens - progress.rank.min) / (nextRank.min - progress.rank.min)) * 100,
          ),
        ),
      )
    : 100;

  const nextMission = progress.missions.find(
    (m) => !m.assessment || m.assessment.state === "draft",
  );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("lumens")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              <DataValue value={progress.totalLumens} locale={locale} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("rank")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold">
                {isFa ? progress.rank.labelFa : progress.rank.label}
              </span>
              {nextRank ? (
                <span className="text-xs text-muted-foreground tabular-nums">
                  {formatLocaleInteger(progress.totalLumens, locale)} /{" "}
                  {formatLocaleInteger(nextRank.min, locale)} {t("lumens")}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">{t("maxRank")}</span>
              )}
            </div>
            <Progress value={rankProgressPercent} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {nextMission ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("nextMission")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {isFa ? nextMission.mission.titleFa : nextMission.mission.title}
            </p>
            {nextMission.chapter && (
              <p className="mt-1 text-sm text-muted-foreground">
                {formatLocaleInteger(nextMission.chapter.order, locale)}.{" "}
                {isFa ? nextMission.chapter.titleFa : nextMission.chapter.title}
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <EmptyState title={t("noMission")} />
      )}
    </div>
  );
}
