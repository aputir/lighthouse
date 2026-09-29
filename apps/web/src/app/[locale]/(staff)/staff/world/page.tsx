import {
  LANDMARK_NAMES_EN,
  LANDMARK_NAMES_FA,
  STAGE_NAMES_EN,
  STAGE_NAMES_FA,
} from "@/lib/progression";
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
        <p className="text-muted-foreground">{t("noActiveCourse")}</p>
      </div>
    );
  }

  const { states } = data;
  const stateMap = new Map(states.map((s) => [s.landmarkIndex, s]));

  const stageBadgeClasses = {
    dormant: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    under_restoration: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    operational: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
    flourishing: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  };

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
          const formattedLumens = isFa
            ? totalLumens.toLocaleString("fa-IR")
            : totalLumens.toString();

          return (
            <div
              key={nameEn}
              className="flex flex-col justify-between rounded-lg border bg-card p-4 shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">{landmarkName}</h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${stageBadgeClasses[stage]}`}
                  >
                    {stageLabel}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-2 border-t text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{formattedLumens}</span> {t("lumens")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
