import { describe, expect, it } from "bun:test";
import { KEEPER_RANKS, getKeeperRank } from "../student-data";

describe("getKeeperRank", () => {
  it("returns Apprentice Keeper for 0 Lumens", () => {
    const rank = getKeeperRank(0);
    expect(rank.label).toBe("Apprentice Keeper");
    expect(rank.labelFa).toBe("کارآموز نگهبان");
    expect(rank.min).toBe(0);
  });

  it("returns Apprentice Keeper for negative Lumens", () => {
    const rank = getKeeperRank(-10);
    expect(rank.label).toBe("Apprentice Keeper");
    expect(rank.labelFa).toBe("کارآموز نگهبان");
  });

  it("returns Apprentice Keeper just below 300 Lumens", () => {
    const rank = getKeeperRank(299);
    expect(rank.label).toBe("Apprentice Keeper");
    expect(rank.labelFa).toBe("کارآموز نگهبان");
  });

  it("returns Beacon Keeper at exactly 300 Lumens", () => {
    const rank = getKeeperRank(300);
    expect(rank.label).toBe("Beacon Keeper");
    expect(rank.labelFa).toBe("نگهبان فانوس");
    expect(rank.min).toBe(300);
  });

  it("returns Beacon Keeper between 300 and 699 Lumens", () => {
    expect(getKeeperRank(500).label).toBe("Beacon Keeper");
    expect(getKeeperRank(699).label).toBe("Beacon Keeper");
  });

  it("returns Signal Keeper at exactly 700 Lumens", () => {
    const rank = getKeeperRank(700);
    expect(rank.label).toBe("Signal Keeper");
    expect(rank.labelFa).toBe("نگهبان سیگنال");
    expect(rank.min).toBe(700);
  });

  it("returns Signal Keeper between 700 and 1199 Lumens", () => {
    expect(getKeeperRank(1000).label).toBe("Signal Keeper");
    expect(getKeeperRank(1199).label).toBe("Signal Keeper");
  });

  it("returns Drift Navigator at exactly 1200 Lumens", () => {
    const rank = getKeeperRank(1200);
    expect(rank.label).toBe("Drift Navigator");
    expect(rank.labelFa).toBe("ناوبر جریان");
    expect(rank.min).toBe(1200);
  });

  it("returns Drift Navigator between 1200 and 1999 Lumens", () => {
    expect(getKeeperRank(1500).label).toBe("Drift Navigator");
    expect(getKeeperRank(1999).label).toBe("Drift Navigator");
  });

  it("returns Harbor Steward at exactly 2000 Lumens", () => {
    const rank = getKeeperRank(2000);
    expect(rank.label).toBe("Harbor Steward");
    expect(rank.labelFa).toBe("مدیر بندر");
    expect(rank.min).toBe(2000);
  });

  it("returns Harbor Steward above 2000 Lumens", () => {
    expect(getKeeperRank(3500).label).toBe("Harbor Steward");
    expect(getKeeperRank(10000).label).toBe("Harbor Steward");
  });

  it("has exactly 5 keeper ranks in ascending order of min Lumens", () => {
    expect(KEEPER_RANKS.length).toBe(5);
    for (let i = 0; i < KEEPER_RANKS.length - 1; i++) {
      const current = KEEPER_RANKS[i];
      const next = KEEPER_RANKS[i + 1];
      if (current && next) {
        expect(current.min).toBeLessThan(next.min);
      }
    }
  });
});
