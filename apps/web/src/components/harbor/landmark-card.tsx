import { type LandmarkStage, STAGE_NAMES_EN, STAGE_NAMES_FA } from "@/lib/progression";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  LandmarkStageBadge,
  Progress,
  cn,
  formatLocaleInteger,
  persianizeDigits,
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
    card: "border-muted bg-muted/40 text-muted-foreground",
    icon: "grayscale opacity-30 scale-95",
    badge: "border-muted bg-muted/40 text-muted-foreground",
  },
  under_restoration: {
    card: "border-status-warning/60 bg-status-warning/15 text-status-warning-foreground",
    icon: "opacity-85",
    badge: "border-status-warning/60 bg-status-warning/15 text-status-warning-foreground",
  },
  operational: {
    card: "border-primary/60 bg-primary/15 text-primary-foreground",
    icon: "opacity-100",
    badge: "border-primary/60 bg-primary/15 text-primary-foreground",
  },
  flourishing: {
    card: "border-status-success/60 bg-status-success/15 text-status-success-foreground",
    icon: "opacity-100 scale-110",
    badge: "border-status-success/60 bg-status-success/15 text-status-success-foreground",
  },
};

export function LandmarkCard({ landmark, stage, totalLumens, locale }: LandmarkCardProps) {
  const isFa = locale === "fa";
  const stageLabel = isFa
    ? (STAGE_NAMES_FA[stage] ?? stage.replace(/_/g, " "))
    : (STAGE_NAMES_EN[stage] ?? stage.replace(/_/g, " "));

  const formattedLumens = formatLocaleInteger(totalLumens, locale);

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
            <span>{isFa ? `${persianizeDigits(progressPercent)}٪` : `${progressPercent}%`}</span>
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
