import { type LandmarkStage, STAGE_NAMES_EN, STAGE_NAMES_FA } from "@/lib/progression";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  LandmarkStageBadge,
  Progress,
  cn,
} from "@lighthouse/ui";
import type { LandmarkMeta } from "./landmark-icons";

export interface LandmarkCardProps {
  landmark: LandmarkMeta;
  stage: LandmarkStage;
  totalLumens: number;
  locale: string;
}

export const STAGE_STYLES: Record<
  LandmarkStage,
  {
    card: string;
    icon: string;
    badge: string;
    borderAccent?: string;
  }
> = {
  dormant: {
    card: "border-slate-800/80 bg-slate-950/60 text-slate-400 hover:border-slate-700/80 shadow-sm",
    icon: "grayscale opacity-30 scale-95",
    badge: "bg-slate-900/90 text-slate-400 border border-slate-800",
  },
  under_restoration: {
    card: "border-amber-500/40 bg-gradient-to-b from-amber-950/20 to-slate-950/80 text-amber-200 shadow-[0_0_20px_-5px_rgba(245,158,11,0.2)] hover:border-amber-400/60",
    icon: "opacity-85 drop-shadow-[0_0_10px_rgba(245,158,11,0.45)]",
    badge: "bg-amber-950/70 text-amber-300 border border-amber-500/40",
  },
  operational: {
    card: "border-cyan-500/50 bg-gradient-to-b from-cyan-950/25 to-slate-950/80 text-cyan-200 shadow-[0_0_25px_-5px_rgba(6,182,212,0.25)] hover:border-cyan-400/70",
    icon: "opacity-100 drop-shadow-[0_0_14px_rgba(6,182,212,0.55)]",
    badge: "bg-cyan-950/70 text-cyan-300 border border-cyan-500/40",
  },
  flourishing: {
    card: "border-emerald-400/60 bg-gradient-to-b from-emerald-950/30 via-slate-950/80 to-slate-950/90 text-emerald-200 shadow-[0_0_30px_-5px_rgba(16,185,129,0.35)] harbor-pulse hover:border-emerald-300",
    icon: "opacity-100 scale-110 drop-shadow-[0_0_20px_rgba(16,185,129,0.75)]",
    badge:
      "bg-emerald-950/80 text-emerald-300 border border-emerald-400/60 shadow-[0_0_10px_rgba(16,185,129,0.35)]",
  },
};

export function LandmarkCard({ landmark, stage, totalLumens, locale }: LandmarkCardProps) {
  const isFa = locale === "fa";
  const stageLabel = isFa
    ? (STAGE_NAMES_FA[stage] ?? stage.replace(/_/g, " "))
    : (STAGE_NAMES_EN[stage] ?? stage.replace(/_/g, " "));

  const formattedLumens = isFa ? totalLumens.toLocaleString("fa-IR") : totalLumens.toLocaleString();

  const unit = isFa ? "لومن" : "L";
  const style = STAGE_STYLES[stage] ?? STAGE_STYLES.dormant;
  const isLighthouse = landmark.index === 0;
  const isBeaconActive = isLighthouse && (stage === "operational" || stage === "flourishing");

  // Threshold to flourishing is 3000 lumens across the course
  const progressPercent = Math.min(100, Math.max(0, Math.round((totalLumens / 3000) * 100)));

  return (
    <Card
      className={cn(
        "group relative flex min-h-[220px] flex-col justify-between overflow-hidden border p-4 sm:p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
        style.card,
      )}
    >
      {/* Header: Name and Stage Badge */}
      <CardHeader className="z-10 p-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="font-semibold text-sm sm:text-base tracking-tight truncate">
            {isFa ? landmark.nameFa : landmark.name}
          </CardTitle>
          <LandmarkStageBadge stage={stage}>{stageLabel}</LandmarkStageBadge>
        </div>
        {/* CS Topic */}
        <p className="text-xs opacity-70 line-clamp-1">
          {isFa ? landmark.topicFa : landmark.topic}
        </p>
      </CardHeader>

      <CardContent className="z-10 flex flex-1 flex-col justify-between p-0">
        <div className="mt-2">
          {/* Stage Label */}
          <p className="text-sm font-medium capitalize tracking-wide">{stageLabel}</p>

          {/* Lumens & Progress */}
          <div className="mt-1 flex items-center justify-between text-xs opacity-60 font-mono">
            <span>
              {formattedLumens} {unit}
            </span>
            <span>
              {isFa ? `${progressPercent.toLocaleString("fa-IR")}٪` : `${progressPercent}%`}
            </span>
          </div>
          <Progress value={progressPercent} className="mt-1.5 h-1.5" />
        </div>

        {/* Visual Landmark Icon & Mission Subtitle */}
        <div className="my-3 flex flex-col items-center justify-center py-2 select-none">
          <span
            className={cn(
              "text-4xl sm:text-5xl transition-all duration-300 group-hover:scale-110",
              style.icon,
            )}
            role="img"
            aria-label={isFa ? landmark.nameFa : landmark.name}
          >
            {landmark.icon}
          </span>
          <span className="mt-2 text-[11px] font-medium opacity-50 group-hover:opacity-85 transition-opacity text-center line-clamp-1">
            {isFa ? landmark.missionFa : landmark.missionEn}
          </span>
        </div>
      </CardContent>

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

      {/* Golden Starlight Edge for Flourishing */}
      {stage === "flourishing" && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-300 to-transparent opacity-80"
          aria-hidden="true"
        />
      )}
    </Card>
  );
}
