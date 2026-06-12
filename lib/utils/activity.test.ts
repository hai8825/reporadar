import { describe, expect, it } from "vitest";
import { getActivityLevel } from "./activity";

const NOW = new Date("2026-06-01T00:00:00Z");

const daysAgo = (days: number): string =>
  new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

describe("getActivityLevel", () => {
  it("is active under 30 days", () => {
    expect(getActivityLevel(daysAgo(0), false, NOW).level).toBe("active");
    expect(getActivityLevel(daysAgo(29), false, NOW).level).toBe("active");
  });

  it("is maintained between 30 and 180 days", () => {
    expect(getActivityLevel(daysAgo(30), false, NOW).level).toBe("maintained");
    expect(getActivityLevel(daysAgo(180), false, NOW).level).toBe("maintained");
  });

  it("is slow between 180 days and a year", () => {
    expect(getActivityLevel(daysAgo(181), false, NOW).level).toBe("slow");
    expect(getActivityLevel(daysAgo(365), false, NOW).level).toBe("slow");
  });

  it("is inactive past a year", () => {
    expect(getActivityLevel(daysAgo(366), false, NOW).level).toBe("inactive");
  });

  it("is inactive when archived, regardless of recent pushes", () => {
    expect(getActivityLevel(daysAgo(1), true, NOW).level).toBe("inactive");
  });

  it("is inactive with no push history", () => {
    expect(getActivityLevel(null, false, NOW).level).toBe("inactive");
  });

  it("carries the spec colors", () => {
    expect(getActivityLevel(daysAgo(1), false, NOW).color).toBe("#22C55E");
    expect(getActivityLevel(daysAgo(60), false, NOW).color).toBe("#EAB308");
    expect(getActivityLevel(daysAgo(200), false, NOW).color).toBe("#F97316");
    expect(getActivityLevel(daysAgo(400), false, NOW).color).toBe("#EF4444");
  });
});
