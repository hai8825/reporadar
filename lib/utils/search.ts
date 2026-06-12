import type { PushedPreset, SearchFilters } from "@/lib/types";

const DAY_MS = 24 * 60 * 60 * 1000;

const PUSHED_DAYS: Record<PushedPreset, number> = {
  week: 7,
  month: 30,
  year: 365,
};

// GitHub search qualifiers want YYYY-MM-DD
const toDateQualifier = (now: Date, daysAgo: number): string =>
  new Date(now.getTime() - daysAgo * DAY_MS).toISOString().slice(0, 10);

/**
 * Builds the single search string sent to `search(type: REPOSITORY)`.
 * Pure: pass `now` in tests to pin date-based qualifiers.
 */
export const buildSearchQuery = (
  filters: SearchFilters,
  now: Date = new Date(),
): string => {
  const parts: string[] = [];

  // Free text scoped to name/description/topics per spec (default would also hit READMEs)
  const text = filters.text.trim();
  if (text) parts.push(text, "in:name,description,topics");

  for (const lang of filters.languages) parts.push(`language:"${lang}"`);
  if (filters.minStars) parts.push(`stars:>=${filters.minStars}`);
  if (filters.pushed)
    parts.push(`pushed:>${toDateQualifier(now, PUSHED_DAYS[filters.pushed])}`);
  if (filters.license) parts.push(`license:${filters.license}`);
  if (filters.beginnerFriendly) parts.push("good-first-issues:>0");
  for (const topic of filters.topics) parts.push(`topic:${topic}`);

  // No filters at all → curated discovery default instead of an invalid empty query
  if (parts.length === 0) parts.push("stars:>10000");

  // Without free text, "best match" ranking is meaningless — sort by stars
  if (!text) parts.push("sort:stars");

  return parts.join(" ");
};
