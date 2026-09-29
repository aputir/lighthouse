import { STAGE_NAMES_EN, STAGE_NAMES_FA } from "@/lib/progression";
import { Card, CardContent, EmptyState, LandmarkStageBadge } from "@lighthouse/ui";
import { getTranslations } from "next-intl/server";
import { getShipLogs } from "./queries";

export default async function LogsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isFa = locale === "fa";
  const t = await getTranslations("staff.logs");

  const data = await getShipLogs();
  if (!data) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <EmptyState title={t("noActiveCourse")} />
      </div>
    );
  }

  const { logs } = data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      {logs.length === 0 ? (
        <EmptyState title={t("noEvents")} />
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const stageLabel = log.newStage
              ? isFa
                ? STAGE_NAMES_FA[log.newStage]
                : STAGE_NAMES_EN[log.newStage]
              : null;

            return (
              <Card key={log.id}>
                <CardContent className="flex items-start justify-between p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {isFa ? log.bodyFa : log.bodyEn}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.triggeredAt).toLocaleDateString(isFa ? "fa-IR" : "en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {log.newStage && stageLabel && (
                    <LandmarkStageBadge stage={log.newStage} className="ms-4 shrink-0">
                      {stageLabel}
                    </LandmarkStageBadge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
