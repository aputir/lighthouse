import { STAGE_NAMES_EN, STAGE_NAMES_FA } from "@/lib/progression";
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
        <p className="text-muted-foreground">{t("noActiveCourse")}</p>
      </div>
    );
  }

  const { logs } = data;

  const stageBadgeClasses = {
    dormant: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    under_restoration: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    operational: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
    flourishing: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      {logs.length === 0 ? (
        <p className="text-muted-foreground">{t("noEvents")}</p>
      ) : (
        <ul className="space-y-3">
          {logs.map((log) => {
            const stageLabel = log.newStage
              ? isFa
                ? STAGE_NAMES_FA[log.newStage]
                : STAGE_NAMES_EN[log.newStage]
              : null;

            return (
              <li
                key={log.id}
                className="flex items-start justify-between rounded-lg border bg-card p-4 shadow-sm"
              >
                <div>
                  <p className="font-medium">{isFa ? log.bodyFa : log.bodyEn}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(log.triggeredAt).toLocaleDateString(isFa ? "fa-IR" : "en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {log.newStage && (
                  <span
                    className={`ms-4 rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0 ${stageBadgeClasses[log.newStage]}`}
                  >
                    {stageLabel}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
