import { LandmarkStageBadge } from "@lighthouse/ui";

const STAGE_ICONS: Record<string, string> = {
  dormant: "⬜",
  under_restoration: "🔧",
  operational: "🔵",
  flourishing: "🌟",
};

export function LandmarkBadge({ stage, label }: { stage: string; label?: string }) {
  return (
    <LandmarkStageBadge stage={stage}>{label ?? STAGE_ICONS[stage] ?? "⬜"}</LandmarkStageBadge>
  );
}
