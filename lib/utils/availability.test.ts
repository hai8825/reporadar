import { describe, expect, it } from "vitest";
import {
  type AvailabilityRow,
  daysUntilArchive,
  planAvailability,
  UNAVAILABLE_GRACE_DAYS,
} from "./availability";

const NOW = new Date("2026-10-17T00:00:00.000Z");
const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(NOW.getTime() - n * DAY_MS);

const row = (over: Partial<AvailabilityRow> & { githubId: string }): AvailabilityRow => ({
  unavailableSince: null,
  archivedAt: null,
  ...over,
});

describe("planAvailability", () => {
  it("leaves a healthy resolved repo untouched", () => {
    const plan = planAvailability([row({ githubId: "A" })], new Set(["A"]), NOW);
    expect(plan).toEqual({ clear: [], mark: [], archive: [] });
  });

  it("clears the stamp when a previously-missing repo resolves again", () => {
    const plan = planAvailability(
      [row({ githubId: "A", unavailableSince: daysAgo(5) })],
      new Set(["A"]),
      NOW,
    );
    expect(plan.clear).toEqual(["A"]);
    expect(plan.mark).toEqual([]);
    expect(plan.archive).toEqual([]);
  });

  it("marks a newly-missing repo", () => {
    const plan = planAvailability([row({ githubId: "A" })], new Set(), NOW);
    expect(plan.mark).toEqual(["A"]);
  });

  it("does not re-mark or archive a repo still inside the grace period", () => {
    const plan = planAvailability(
      [row({ githubId: "A", unavailableSince: daysAgo(UNAVAILABLE_GRACE_DAYS - 1) })],
      new Set(),
      NOW,
    );
    expect(plan).toEqual({ clear: [], mark: [], archive: [] });
  });

  it("archives a repo once it crosses the grace boundary", () => {
    const atBoundary = planAvailability(
      [row({ githubId: "A", unavailableSince: daysAgo(UNAVAILABLE_GRACE_DAYS) })],
      new Set(),
      NOW,
    );
    expect(atBoundary.archive).toEqual(["A"]);

    const pastBoundary = planAvailability(
      [row({ githubId: "B", unavailableSince: daysAgo(UNAVAILABLE_GRACE_DAYS + 10) })],
      new Set(),
      NOW,
    );
    expect(pastBoundary.archive).toEqual(["B"]);
  });

  it("ignores already-archived rows entirely", () => {
    const plan = planAvailability(
      [row({ githubId: "A", archivedAt: daysAgo(1), unavailableSince: daysAgo(40) })],
      new Set(),
      NOW,
    );
    expect(plan).toEqual({ clear: [], mark: [], archive: [] });
  });

  it("partitions a mixed collection correctly in one pass", () => {
    const rows = [
      row({ githubId: "healthy" }),
      row({ githubId: "recovered", unavailableSince: daysAgo(3) }),
      row({ githubId: "newly-gone" }),
      row({ githubId: "grace", unavailableSince: daysAgo(5) }),
      row({ githubId: "expired", unavailableSince: daysAgo(45) }),
      row({ githubId: "archived", archivedAt: daysAgo(1) }),
    ];
    const plan = planAvailability(rows, new Set(["healthy", "recovered"]), NOW);
    expect(plan.clear).toEqual(["recovered"]);
    expect(plan.mark).toEqual(["newly-gone"]);
    expect(plan.archive).toEqual(["expired"]);
  });
});

describe("daysUntilArchive", () => {
  it("is the full grace window for a just-stamped repo", () => {
    expect(daysUntilArchive(NOW, NOW)).toBe(UNAVAILABLE_GRACE_DAYS);
  });

  it("counts down as the repo stays unavailable", () => {
    expect(daysUntilArchive(daysAgo(10), NOW)).toBe(UNAVAILABLE_GRACE_DAYS - 10);
  });

  it("never goes negative past the boundary", () => {
    expect(daysUntilArchive(daysAgo(100), NOW)).toBe(0);
  });

  it("accepts an ISO string", () => {
    expect(daysUntilArchive(daysAgo(10).toISOString(), NOW)).toBe(
      UNAVAILABLE_GRACE_DAYS - 10,
    );
  });
});
