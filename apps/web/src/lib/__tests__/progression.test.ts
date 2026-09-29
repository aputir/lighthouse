import { describe, expect, it } from "bun:test";
import { computeLandmarkStage, computeLumens, generateShipLogEntry } from "../progression";

describe("computeLumens", () => {
  it("returns maxLumens when rawScore is 100", () => {
    expect(computeLumens(100, 100)).toBe(100);
  });

  it("rounds to nearest integer", () => {
    expect(computeLumens(75, 100)).toBe(75);
    expect(computeLumens(33.3, 100)).toBe(33);
  });

  it("returns 0 for rawScore 0", () => {
    expect(computeLumens(0, 100)).toBe(0);
  });

  it("scales with maxLumens", () => {
    expect(computeLumens(50, 200)).toBe(100);
  });
});

describe("computeLandmarkStage", () => {
  const thresholds = { toUnderRestoration: 500, toOperational: 1500, toFlourishing: 3000 };

  it("returns dormant below first threshold", () => {
    expect(computeLandmarkStage(0, thresholds)).toBe("dormant");
    expect(computeLandmarkStage(499, thresholds)).toBe("dormant");
  });

  it("returns under_restoration at first threshold", () => {
    expect(computeLandmarkStage(500, thresholds)).toBe("under_restoration");
    expect(computeLandmarkStage(1499, thresholds)).toBe("under_restoration");
  });

  it("returns operational at second threshold", () => {
    expect(computeLandmarkStage(1500, thresholds)).toBe("operational");
    expect(computeLandmarkStage(2999, thresholds)).toBe("operational");
  });

  it("returns flourishing at third threshold", () => {
    expect(computeLandmarkStage(3000, thresholds)).toBe("flourishing");
    expect(computeLandmarkStage(99999, thresholds)).toBe("flourishing");
  });
});

describe("generateShipLogEntry", () => {
  it("generates correct narrative for known landmark", () => {
    const entry = generateShipLogEntry(0, "under_restoration");
    expect(entry.bodyEn).toBe("The Lighthouse is now under restoration.");
    expect(entry.bodyFa).toBe("فانوس دریایی اکنون در حال بازسازی است.");
  });

  it("generates correct narrative for flourishing stage", () => {
    const entry = generateShipLogEntry(1, "flourishing");
    expect(entry.bodyEn).toBe("Arrival Docks is now flourishing.");
    expect(entry.bodyFa).toBe("اسکله ورود اکنون شکوفا است.");
  });

  it("falls back gracefully for landmarkIndex out of standard range", () => {
    const entry = generateShipLogEntry(8, "operational");
    expect(entry.bodyEn).toBe("Landmark 9 is now operational.");
    expect(entry.bodyFa).toBe("نقطه عطف 9 اکنون عملیاتی است.");
  });
});
