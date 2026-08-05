// Shared domain types. GraphQL response shapes mirror the fragments in lib/graphql.

import type { RepoCardFragment } from "@/gql/graphql";

export type RateLimitInfo = {
  cost: number;
  remaining: number;
  resetAt: string;
};

export type LanguageRef = {
  name: string;
  color: string | null;
};

// Migration shim (M1): the card shape is now derived from GitHub's introspected
// schema instead of hand-written. Consumers keep the domain name until M2 gives
// them FragmentType-based props, at which point this alias goes away.
export type RepoCardData = RepoCardFragment;

export type CommitNode = {
  oid: string;
  messageHeadline: string;
  committedDate: string;
  url: string;
  author: { name: string | null } | null;
};

export type IssueNode = {
  id: string;
  number: number;
  title: string;
  url: string;
  createdAt: string;
};

export type RepoDetailData = RepoCardData & {
  homepageUrl: string | null;
  diskUsage: number | null; // in kilobytes
  openIssues: { totalCount: number };
  openPullRequests: { totalCount: number };
  watchers: { totalCount: number };
  languages: {
    totalSize: number;
    edges: Array<{ size: number; node: LanguageRef }> | null;
  } | null;
  readme: { text: string | null } | null;
  defaultBranchRef: {
    name: string;
    target: { history: { nodes: CommitNode[] | null } } | null;
  } | null;
  issues: { nodes: IssueNode[] | null };
};

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
