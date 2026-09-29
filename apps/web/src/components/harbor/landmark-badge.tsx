// Exported for future use by student harbor view
export function LandmarkBadge({ stage }: { stage: string }) {
  const icons: Record<string, string> = {
    dormant: "⬜",
    under_restoration: "🔧",
    operational: "🔵",
    flourishing: "🌟",
  };
  return <span>{icons[stage] ?? "⬜"}</span>;
}
