export type LandmarkStage = "dormant" | "under_restoration" | "operational" | "flourishing";

export interface ThresholdConfig {
  toUnderRestoration: number;
  toOperational: number;
  toFlourishing: number;
}

/**
 * Compute Lumens from a raw score percentage and a mission's max Lumens.
 * rawScore: 0–100 (percentage)
 * maxLumens: the mission's configured max (default 100)
 */
export function computeLumens(rawScore: number, maxLumens: number): number {
  return Math.round((rawScore / 100) * maxLumens);
}

/**
 * Determine the landmark stage from the class's total Lumens for that landmark.
 */
export function computeLandmarkStage(
  totalLumens: number,
  thresholds: ThresholdConfig,
): LandmarkStage {
  if (totalLumens >= thresholds.toFlourishing) return "flourishing";
  if (totalLumens >= thresholds.toOperational) return "operational";
  if (totalLumens >= thresholds.toUnderRestoration) return "under_restoration";
  return "dormant";
}

export const LANDMARK_NAMES_EN = [
  "The Lighthouse",
  "Arrival Docks",
  "Signal Tower",
  "Tide Observatory",
  "Fogway Buoys",
  "The Shipyard",
  "Harbor Control",
  "Relay Station",
];

export const LANDMARK_NAMES_FA = [
  "فانوس دریایی",
  "اسکله ورود",
  "برج سیگنال",
  "رصدخانه جزر و مد",
  "شناورهای مه",
  "کشتی‌سازی",
  "کنترل بندر",
  "ایستگاه رله",
];

export const STAGE_NAMES_EN: Record<LandmarkStage, string> = {
  dormant: "dormant",
  under_restoration: "under restoration",
  operational: "operational",
  flourishing: "flourishing",
};

export const STAGE_NAMES_FA: Record<LandmarkStage, string> = {
  dormant: "غیرفعال",
  under_restoration: "در حال بازسازی",
  operational: "عملیاتی",
  flourishing: "شکوفا",
};

/**
 * Generate a Ship's Log narrative for a landmark stage transition.
 */
export function generateShipLogEntry(
  landmarkIndex: number,
  newStage: LandmarkStage,
): { bodyFa: string; bodyEn: string } {
  const nameEn = LANDMARK_NAMES_EN[landmarkIndex] ?? `Landmark ${landmarkIndex + 1}`;
  const nameFa = LANDMARK_NAMES_FA[landmarkIndex] ?? `نقطه عطف ${landmarkIndex + 1}`;

  return {
    bodyEn: `${nameEn} is now ${STAGE_NAMES_EN[newStage]}.`,
    bodyFa: `${nameFa} اکنون ${STAGE_NAMES_FA[newStage]} است.`,
  };
}
