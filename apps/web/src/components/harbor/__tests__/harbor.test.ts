import { describe, expect, it } from "bun:test";
import { ShipLogFeed } from "@/app/[locale]/(public)/harbor/ship-log-feed";
import RootPage from "@/app/[locale]/page";
import type { LandmarkState, ShipLog } from "@lighthouse/db";
import { HarborMap, LANDMARKS, STAGE_COLORS } from "../harbor-map";
import { LandmarkBadge } from "../landmark-badge";

describe("LandmarkBadge", () => {
  it("renders correct icon for each landmark stage", () => {
    const dormant = LandmarkBadge({ stage: "dormant" });
    expect(dormant.props.children).toBe("⬜");

    const restoration = LandmarkBadge({ stage: "under_restoration" });
    expect(restoration.props.children).toBe("🔧");

    const operational = LandmarkBadge({ stage: "operational" });
    expect(operational.props.children).toBe("🔵");

    const flourishing = LandmarkBadge({ stage: "flourishing" });
    expect(flourishing.props.children).toBe("🌟");
  });

  it("falls back to default icon for unknown stage", () => {
    const unknown = LandmarkBadge({ stage: "unknown_stage" });
    expect(unknown.props.children).toBe("⬜");
  });
});

describe("HarborMap", () => {
  it("contains all 8 landmarks in order with expected topics", () => {
    expect(LANDMARKS).toHaveLength(8);
    expect(LANDMARKS.map((l) => l.index)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(LANDMARKS[0].name).toBe("The Lighthouse");
    expect(LANDMARKS[0].nameFa).toBe("فانوس دریایی");
    expect(LANDMARKS[7].name).toBe("Relay Station");
    expect(LANDMARKS[7].nameFa).toBe("ایستگاه رله");
  });

  it("renders all 8 landmarks when states is empty (all default to dormant)", () => {
    const map = HarborMap({ states: [], locale: "fa" });
    expect(map.props.className).toContain("grid");
    const children = map.props.children;
    expect(children).toHaveLength(8);

    // First card check
    const firstCard = children[0];
    expect(firstCard.props.className).toContain(STAGE_COLORS.dormant);
  });

  it("renders localized Persian names, stage labels, and Lumens in fa locale", () => {
    const mockStates: LandmarkState[] = [
      {
        id: "1",
        courseId: "course-1",
        landmarkIndex: 0,
        stage: "flourishing",
        totalLumens: 3200,
        updatedAt: new Date(),
      },
    ];

    const map = HarborMap({ states: mockStates, locale: "fa" });
    const firstCard = map.props.children[0];
    expect(firstCard.props.className).toContain(STAGE_COLORS.flourishing);

    // Check inner content
    const cardChildren = firstCard.props.children;
    // cardChildren[0] is header with name and badge
    const header = cardChildren[0];
    expect(header.props.children[0].props.children).toBe("فانوس دریایی");

    // cardChildren[2] is stage label
    const stageP = cardChildren[2];
    expect(stageP.props.children).toBe("شکوفا");

    // cardChildren[3] is Lumens
    const lumensP = cardChildren[3];
    expect(lumensP.props.children).toContain((3200).toLocaleString("fa-IR"));
    expect(lumensP.props.children).toContain("لومن");
  });

  it("renders English names, stage labels, and Lumens in en locale", () => {
    const mockStates: LandmarkState[] = [
      {
        id: "1",
        courseId: "course-1",
        landmarkIndex: 2,
        stage: "operational",
        totalLumens: 1800,
        updatedAt: new Date(),
      },
    ];

    const map = HarborMap({ states: mockStates, locale: "en" });
    const signalTowerCard = map.props.children[2];
    expect(signalTowerCard.props.className).toContain(STAGE_COLORS.operational);

    const cardChildren = signalTowerCard.props.children;
    const header = cardChildren[0];
    expect(header.props.children[0].props.children).toBe("Signal Tower");

    const stageP = cardChildren[2];
    expect(stageP.props.children).toBe("operational");

    const lumensP = cardChildren[3];
    expect(lumensP.props.children).toContain((1800).toLocaleString());
    expect(lumensP.props.children).toContain("L");
  });
});

describe("ShipLogFeed", () => {
  it("returns null when logs is empty", () => {
    const feed = ShipLogFeed({ logs: [], locale: "en" });
    expect(feed).toBeNull();
  });

  it("renders log entries with Persian text when locale is fa", () => {
    const sampleLogs: ShipLog[] = [
      {
        id: "log-1",
        courseId: "course-1",
        landmarkIndex: 0,
        newStage: "under_restoration",
        bodyFa: "فانوس دریایی اکنون در حال بازسازی است.",
        bodyEn: "The Lighthouse is now under restoration.",
        triggeredAt: new Date("2026-09-29T10:00:00Z"),
      },
    ];

    const feed = ShipLogFeed({ logs: sampleLogs, locale: "fa" });
    expect(feed).not.toBeNull();
    const sectionChildren = feed?.props.children;
    const heading = sectionChildren[0];
    expect(heading.props.children).toBe("دفتر کشتی");

    const list = sectionChildren[1];
    const items = list.props.children;
    expect(items).toHaveLength(1);
    const item = items[0];
    expect(item.props.children[0].props.children).toBe("فانوس دریایی اکنون در حال بازسازی است.");
  });

  it("renders log entries with English text when locale is en", () => {
    const sampleLogs: ShipLog[] = [
      {
        id: "log-1",
        courseId: "course-1",
        landmarkIndex: 0,
        newStage: "operational",
        bodyFa: "فانوس دریایی اکنون عملیاتی است.",
        bodyEn: "The Lighthouse is now operational.",
        triggeredAt: new Date("2026-09-29T10:00:00Z"),
      },
    ];

    const feed = ShipLogFeed({ logs: sampleLogs, locale: "en" });
    expect(feed).not.toBeNull();
    const sectionChildren = feed?.props.children;
    const heading = sectionChildren[0];
    expect(heading.props.children).toBe("Ship's Log");

    const list = sectionChildren[1];
    const items = list.props.children;
    expect(items[0].props.children[0].props.children).toBe("The Lighthouse is now operational.");
  });
});

describe("RootPage", () => {
  it("redirects to /[locale]/harbor for fa locale", async () => {
    try {
      await RootPage({ params: Promise.resolve({ locale: "fa" }) });
      expect(true).toBe(false); // should have redirected
    } catch (error) {
      expect((error as Error).message).toContain("NEXT_REDIRECT");
    }
  });

  it("redirects to /[locale]/harbor for en locale", async () => {
    try {
      await RootPage({ params: Promise.resolve({ locale: "en" }) });
      expect(true).toBe(false); // should have redirected
    } catch (error) {
      expect((error as Error).message).toContain("NEXT_REDIRECT");
    }
  });
});
