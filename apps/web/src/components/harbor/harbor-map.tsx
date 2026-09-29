import { type LandmarkStage, STAGE_NAMES_EN, STAGE_NAMES_FA } from "@/lib/progression";
import type { LandmarkState } from "@lighthouse/db";
import { LandmarkBadge } from "./landmark-badge";

export const LANDMARKS = [
  {
    index: 0,
    name: "The Lighthouse",
    nameFa: "فانوس دریایی",
    topic: "Classes · Encapsulation",
    topicFa: "کلاس‌ها · کپسوله‌سازی",
    icon: "🏮",
    mission: "Wake the lamp",
    missionFa: "بیدار کردن فانوس",
  },
  {
    index: 1,
    name: "Arrival Docks",
    nameFa: "اسکله ورود",
    topic: "Inheritance · Composition",
    topicFa: "وراثت · ترکیب",
    icon: "⚓",
    mission: "Welcome the fleet",
    missionFa: "استقبال از ناوگان",
  },
  {
    index: 2,
    name: "Signal Tower",
    nameFa: "برج سیگنال",
    topic: "Interfaces · Polymorphism",
    topicFa: "واسط‌ها · چندریختی",
    icon: "📡",
    mission: "The signal code",
    missionFa: "کد سیگنال",
  },
  {
    index: 3,
    name: "Tide Observatory",
    nameFa: "رصدخانه جزر و مد",
    topic: "Observer Pattern",
    topicFa: "الگوی ناظر",
    icon: "🔭",
    mission: "Listen to the tide",
    missionFa: "شنیدن صدای جزر و مد",
  },
  {
    index: 4,
    name: "Fogway Buoys",
    nameFa: "شناورهای مه",
    topic: "Strategy Pattern",
    topicFa: "الگوی راهبرد",
    icon: "🪔",
    mission: "Find a way through",
    missionFa: "یافتن مسیر در مه",
  },
  {
    index: 5,
    name: "The Shipyard",
    nameFa: "کشتی‌سازی",
    topic: "Factory · Builder",
    topicFa: "الگوی کارخانه و سازنده",
    icon: "🚢",
    mission: "Build for the voyage",
    missionFa: "ساخت برای سفر دریایی",
  },
  {
    index: 6,
    name: "Harbor Control",
    nameFa: "کنترل بندر",
    topic: "Command · State",
    topicFa: "الگوی فرمان و وضعیت",
    icon: "🧭",
    mission: "Keep the harbor moving",
    missionFa: "تداوم حرکت بندرگاه",
  },
  {
    index: 7,
    name: "Relay Station",
    nameFa: "ایستگاه رله",
    topic: "Decorator · Adapter",
    topicFa: "الگوی تزیین‌کننده و تطبیق‌دهنده",
    icon: "📻",
    mission: "Reconnect the old radio",
    missionFa: "وصل مجدد رادیوی کهن",
  },
] as const;

export const STAGE_COLORS: Record<LandmarkStage, string> = {
  dormant: "border-slate-800/80 bg-slate-950/60 text-slate-400 hover:border-slate-700/80 shadow-sm",
  under_restoration:
    "border-amber-500/40 bg-gradient-to-b from-amber-950/20 to-slate-950/80 text-amber-200 shadow-[0_0_20px_-5px_rgba(245,158,11,0.2)] hover:border-amber-400/60",
  operational:
    "border-cyan-500/50 bg-gradient-to-b from-cyan-950/25 to-slate-950/80 text-cyan-200 shadow-[0_0_25px_-5px_rgba(6,182,212,0.25)] hover:border-cyan-400/70",
  flourishing:
    "border-emerald-400/60 bg-gradient-to-b from-emerald-950/30 via-slate-950/80 to-slate-950/90 text-emerald-200 shadow-[0_0_30px_-5px_rgba(16,185,129,0.35)] harbor-pulse hover:border-emerald-300",
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
    <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
      {LANDMARKS.map((landmark) => {
        const state = stateMap.get(landmark.index);
        const stage = (state?.stage ?? "dormant") as LandmarkStage;
        const stageLabel = isFa
          ? (STAGE_NAMES_FA[stage] ?? stage.replace(/_/g, " "))
          : (STAGE_NAMES_EN[stage] ?? stage.replace(/_/g, " "));

        const totalLumens = state?.totalLumens ?? 0;
        const formattedLumens = isFa
          ? totalLumens.toLocaleString("fa-IR")
          : totalLumens.toLocaleString();
        const unit = isFa ? "لومن" : "L";

        const isLighthouse = landmark.index === 0;
        const isBeaconActive = isLighthouse && (stage === "operational" || stage === "flourishing");

        const iconFilterClass =
          stage === "dormant"
            ? "grayscale opacity-30 scale-95"
            : stage === "under_restoration"
              ? "opacity-85 drop-shadow-[0_0_10px_rgba(245,158,11,0.45)]"
              : stage === "operational"
                ? "opacity-100 drop-shadow-[0_0_14px_rgba(6,182,212,0.55)]"
                : "opacity-100 scale-110 drop-shadow-[0_0_20px_rgba(16,185,129,0.75)]";

        return (
          <div
            key={landmark.index}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 sm:p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl min-h-[220px] ${STAGE_COLORS[stage]}`}
          >
            {/* Header: Name and Stage Badge */}
            <div className="flex items-center justify-between gap-2 z-10">
              <p className="font-semibold text-sm sm:text-base tracking-tight">
                {isFa ? landmark.nameFa : landmark.name}
              </p>
              <LandmarkBadge stage={stage} />
            </div>

            {/* Topic subtitle */}
            <p className="mt-1 text-xs opacity-70 line-clamp-1 z-10">
              {isFa ? landmark.topicFa : landmark.topic}
            </p>

            {/* Stage Label */}
            <p className="mt-2 text-sm font-medium capitalize tracking-wide z-10">{stageLabel}</p>

            {/* Lumens */}
            <p className="text-xs opacity-60 font-mono z-10">
              {formattedLumens} {unit}
            </p>

            {/* Visual Icon & Mission Emblem */}
            <div className="my-3 flex flex-col items-center justify-center py-2 select-none z-10">
              <span
                className={`text-4xl sm:text-5xl transition-all duration-300 group-hover:scale-110 ${iconFilterClass}`}
                role="img"
                aria-label={isFa ? landmark.nameFa : landmark.name}
              >
                {landmark.icon}
              </span>
              <span className="mt-2 text-[11px] font-medium opacity-50 group-hover:opacity-85 transition-opacity text-center line-clamp-1">
                {isFa ? landmark.missionFa : landmark.mission}
              </span>
            </div>

            {/* Rotating Beacon Beam for active Lighthouse */}
            {isBeaconActive && (
              <div
                className="pointer-events-none absolute -inset-[150%] harbor-beacon-sweep opacity-25 mix-blend-screen"
                style={{
                  background:
                    "conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(56, 189, 248, 0.25) 25deg, rgba(254, 240, 138, 0.55) 35deg, rgba(56, 189, 248, 0.25) 45deg, transparent 70deg, transparent 360deg)",
                }}
                aria-hidden="true"
              />
            )}

            {/* Flourishing golden starlight accent line */}
            {stage === "flourishing" && (
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-300 to-transparent opacity-80"
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
