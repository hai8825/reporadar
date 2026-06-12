// Shared domain types. GraphQL response shapes mirror the fragments in lib/graphql.

export type RateLimitInfo = {
  cost: number;
  remaining: number;
  resetAt: string;
};

export type LanguageRef = {
  name: string;
  color: string | null;
};

export type RepoCardData = {
  id: string;
  nameWithOwner: string;
  name: string;
  owner: { login: string };
  description: string | null;
  url: string;
  stargazerCount: number;
  forkCount: number;
  pushedAt: string | null;
  isArchived: boolean;
  primaryLanguage: LanguageRef | null;
  licenseInfo: { spdxId: string | null; name: string } | null;
  repositoryTopics: { nodes: Array<{ topic: { name: string } }> | null };
  goodFirstIssues: { totalCount: number };
};

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

// What we persist to localStorage for the saved collection
export type SavedRepo = {
  id: string;
  nameWithOwner: string;
  savedAt: string; // ISO date, used for sort order
  tags: string[]; // freeform collection labels, e.g. "esp32" — a repo can have many
};
