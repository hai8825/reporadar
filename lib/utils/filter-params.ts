import type { PushedPreset, SearchFilters, StarPreset } from "@/lib/types";
import { EMPTY_FILTERS, STAR_PRESETS } from "@/lib/types";

// Filters ⇄ URL query params so search results are shareable links.
// Param names kept short: ?q=react&langs=TypeScript&stars=1000&gfi=1

const PUSHED_VALUES: PushedPreset[] = ["week", "month", "year"];

export const filtersFromParams = (params: URLSearchParams): SearchFilters => {
  const stars = Number(params.get("stars"));
  const pushed = params.get("pushed");

  return {
    text: params.get("q") ?? "",
    languages: splitParam(params.get("langs")),
    minStars: STAR_PRESETS.includes(stars as StarPreset)
      ? (stars as StarPreset)
      : null,
    pushed: PUSHED_VALUES.includes(pushed as PushedPreset)
      ? (pushed as PushedPreset)
      : null,
    license: params.get("license"),
    beginnerFriendly: params.get("gfi") === "1",
    topics: splitParam(params.get("topics")),
  };
};

export const filtersToParams = (filters: SearchFilters): URLSearchParams => {
  const params = new URLSearchParams();
  if (filters.text) params.set("q", filters.text);
  if (filters.languages.length) params.set("langs", filters.languages.join(","));
  if (filters.minStars) params.set("stars", String(filters.minStars));
  if (filters.pushed) params.set("pushed", filters.pushed);
  if (filters.license) params.set("license", filters.license);
  if (filters.beginnerFriendly) params.set("gfi", "1");
  if (filters.topics.length) params.set("topics", filters.topics.join(","));
  return params;
};

export const hasActiveFilters = (filters: SearchFilters): boolean =>
  filtersToParams(filters).toString() !== "";

const splitParam = (value: string | null): string[] =>
  value ? value.split(",").filter(Boolean) : [];

export { EMPTY_FILTERS };
