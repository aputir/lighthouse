import { type LandmarkStage, STAGE_NAMES_EN, STAGE_NAMES_FA } from "@/lib/progression";
import type { LandmarkState } from "@lighthouse/db";
import { LandmarkBadge } from "./landmark-badge";

export const LANDMARKS = [
  { index: 0, name: "The Lighthouse", nameFa: "فانوس دریایی", topic: "Classes · Encapsulation" },
  { index: 1, name: "Arrival Docks", nameFa: "اسکله ورود", topic: "Inheritance · Composition" },
  { index: 2, name: "Signal Tower", nameFa: "برج سیگنال", topic: "Interfaces · Polymorphism" },
  { index: 3, name: "Tide Observatory", nameFa: "رصدخانه جزر و مد", topic: "Observer Pattern" },
  { index: 4, name: "Fogway Buoys", nameFa: "شناورهای مه", topic: "Strategy Pattern" },
  { index: 5, name: "The Shipyard", nameFa: "کشتی‌سازی", topic: "Factory · Builder" },
  { index: 6, name: "Harbor Control", nameFa: "کنترل بندر", topic: "Command · State" },
  { index: 7, name: "Relay Station", nameFa: "ایستگاه رله", topic: "Decorator · Adapter" },
] as const;

export const STAGE_COLORS = {
  dormant: "bg-muted text-muted-foreground",
  under_restoration: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300",
  operational: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
  flourishing: "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300",
};

export function HarborMap({
  states,
  locale,
}: {
  states: LandmarkState[];
  locale: string;
}) {
  const isFa = locale === "fa";
  const stateMap = new Map(states.map((s) => [s.landmarkIndex, s]));

  return (
    <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
      {LANDMARKS.map((landmark) => {
        const state = stateMap.get(landmark.index);
        const stage = state?.stage ?? "dormant";
        const stageLabel = isFa
          ? (STAGE_NAMES_FA[stage as LandmarkStage] ?? stage.replace(/_/g, " "))
          : (STAGE_NAMES_EN[stage as LandmarkStage] ?? stage.replace(/_/g, " "));

        return (
          <div
            key={landmark.index}
            className={`rounded-lg border p-4 transition-colors ${STAGE_COLORS[stage]}`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold">{isFa ? landmark.nameFa : landmark.name}</p>
              <LandmarkBadge stage={stage} />
            </div>
            <p className="mt-1 text-xs opacity-70">{landmark.topic}</p>
            <p className="mt-2 text-sm font-medium capitalize">{stageLabel}</p>
            <p className="text-xs opacity-60">
              {isFa
                ? (state?.totalLumens ?? 0).toLocaleString("fa-IR")
                : (state?.totalLumens ?? 0).toLocaleString()}{" "}
              {isFa ? "لومن" : "L"}
            </p>
          </div>
        );
      })}
    </div>
  );
}
