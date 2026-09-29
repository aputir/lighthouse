import {
  LANDMARK_NAMES_EN,
  LANDMARK_NAMES_FA,
  STAGE_NAMES_EN,
  STAGE_NAMES_FA,
} from "@/lib/progression";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataValue,
  EmptyState,
  LandmarkStageBadge,
  Progress,
} from "@lighthouse/ui";
import { getTranslations } from "next-intl/server";
import { getWorldState } from "./queries";

export default async function WorldPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isFa = locale === "fa";
  const t = await getTranslations("staff.world");

  const data = await getWorldState();
  if (!data) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <EmptyState title={t("noActiveCourse")} />
      </div>
    );
  }

  const { states, thresholds } = data;
  const stateMap = new Map(states.map((s) => [s.landmarkIndex, s]));
  const thresholdMap = new Map(thresholds.map((th) => [th.landmarkIndex, th]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {LANDMARK_NAMES_EN.map((nameEn, i) => {
          const landmarkName = isFa ? LANDMARK_NAMES_FA[i] : nameEn;
          const state = stateMap.get(i);
          const stage = state?.stage ?? "dormant";
          const stageLabel = isFa ? STAGE_NAMES_FA[stage] : STAGE_NAMES_EN[stage];
          const totalLumens = state?.totalLumens ?? 0;

          const threshold = thresholdMap.get(i) ?? {
            toUnderRestoration: 500,
            toOperational: 1500,
            toFlourishing: 3000,
          };

          let targetLumens = threshold.toUnderRestoration;
          if (stage === "under_restoration") {
            targetLumens = threshold.toOperational;
          } else if (stage === "operational" || stage === "flourishing") {
            targetLumens = threshold.toFlourishing;
          }

          const progressPercentage = Math.min(100, Math.round((totalLumens / targetLumens) * 100));

          return (
            <Card key={nameEn} className="flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold">{landmarkName}</CardTitle>
                    <LandmarkStageBadge stage={stage}>{stageLabel}</LandmarkStageBadge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{t("lumens")}</span>
                      <span>
                        <DataValue value={totalLumens} locale={locale} /> /{" "}
                        <DataValue value={targetLumens} locale={locale} />
                      </span>
                    </div>
                    <Progress value={progressPercentage} />
                  </div>
                </CardContent>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
