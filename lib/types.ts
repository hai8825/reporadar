// Shared domain types. GraphQL response shapes are no longer here — they are
// generated from GitHub's schema into gql/ and consumed via fragment types.

import type { SearchReposQuery } from "@/gql/graphql";

// Every operation selects the same rateLimit block; derive the shape from one
// of them so the nav badge cannot drift from what the API returns.
export type RateLimitInfo = NonNullable<SearchReposQuery["rateLimit"]>;

// Preset values for the "minimum stars" filter
export const STAR_PRESETS = [100, 1_000, 10_000, 50_000] as const;
export type StarPreset = (typeof STAR_PRESETS)[number];

export type PushedPreset = "week" | "month" | "year";

export type SearchFilters = {
  text: string;
  languages: string[];
  minStars: StarPreset | null;
  pushed: PushedPreset | null;
  license: string | null; // SPDX id, e.g. "mit"
  beginnerFriendly: boolean;
  topics: string[];
};

export const EMPTY_FILTERS: SearchFilters = {
  text: "",
  languages: [],
  minStars: null,
  pushed: null,
  license: null,
  beginnerFriendly: false,
  topics: [],
};

// A repo staged in the comparison tray — just enough to build the /compare URL
export type ComparisonItem = {
  id: string;
  nameWithOwner: string;
};

// Client-facing shape of a saved repo (persisted in Postgres; the GitHub node
// id is the client key). Mirrors the SavedState the server actions return.
export type SavedRepo = {
  id: string;
  nameWithOwner: string;
  savedAt: string; // ISO date, used for sort order
  tags: string[]; // freeform labels, e.g. "esp32" — a repo can have many
  folder: string | null; // a repo lives in at most ONE folder (collection)
};
