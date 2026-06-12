import { describe, expect, it } from "vitest";
import { EMPTY_FILTERS, type SearchFilters } from "@/lib/types";
import { buildSearchQuery } from "./search";

const NOW = new Date("2026-06-01T00:00:00Z");

const filters = (overrides: Partial<SearchFilters>): SearchFilters => ({
  ...EMPTY_FILTERS,
  ...overrides,
});

describe("buildSearchQuery", () => {
  it("falls back to a curated default when no filters are set", () => {
    expect(buildSearchQuery(EMPTY_FILTERS, NOW)).toBe("stars:>10000 sort:stars");
  });

  it("scopes free text to name/description/topics", () => {
    expect(buildSearchQuery(filters({ text: "state machine" }), NOW)).toBe(
      "state machine in:name,description,topics",
    );
  });

  it("adds one language qualifier per selected language", () => {
    expect(
      buildSearchQuery(filters({ languages: ["TypeScript", "Rust"] }), NOW),
    ).toBe('language:"TypeScript" language:"Rust" sort:stars');
  });

  it("translates star and pushed presets into qualifiers", () => {
    expect(
      buildSearchQuery(filters({ minStars: 1000, pushed: "week" }), NOW),
    ).toBe("stars:>=1000 pushed:>2026-05-25 sort:stars");
  });

  it("combines all seven filters into one query string", () => {
    const query = buildSearchQuery(
      filters({
        text: "parser",
        languages: ["Go"],
        minStars: 100,
        pushed: "year",
        license: "mit",
        beginnerFriendly: true,
        topics: ["compiler", "wasm"],
      }),
      NOW,
    );
    expect(query).toBe(
      'parser in:name,description,topics language:"Go" stars:>=100 ' +
        "pushed:>2025-06-01 license:mit good-first-issues:>0 " +
        "topic:compiler topic:wasm",
    );
  });

  it("sorts by stars only when there is no free text", () => {
    expect(buildSearchQuery(filters({ text: "react" }), NOW)).not.toContain(
      "sort:stars",
    );
    expect(buildSearchQuery(filters({ topics: ["cli"] }), NOW)).toContain(
      "sort:stars",
    );
  });
});
