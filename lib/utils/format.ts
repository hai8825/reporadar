// Small pure formatting helpers used across cards, detail, and compare views.

/** 1234 -> "1.2k", 56789 -> "56.8k", 1234567 -> "1.2m" */
export const formatCount = (count: number): string => {
  if (count < 1_000) return String(count);
  if (count < 1_000_000) return `${trimZero(count / 1_000)}k`;
  return `${trimZero(count / 1_000_000)}m`;
};

const trimZero = (n: number): string => n.toFixed(1).replace(/\.0$/, "");

/** ISO date -> "Jan 5, 2026" */
export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

/** ISO date -> "3 days ago" (coarse, for tooltips) */
export const timeAgo = (iso: string, now: Date = new Date()): string => {
  const seconds = Math.floor((now.getTime() - new Date(iso).getTime()) / 1000);
  const units: Array<[label: string, seconds: number]> = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  for (const [label, unitSeconds] of units) {
    const value = Math.floor(seconds / unitSeconds);
    if (value >= 1) return `${value} ${label}${value > 1 ? "s" : ""} ago`;
  }
  return "just now";
};

/** GitHub diskUsage is in KB */
export const formatDiskSize = (kb: number | null): string => {
  if (kb === null) return "—";
  if (kb < 1_024) return `${kb} KB`;
  if (kb < 1_048_576) return `${(kb / 1_024).toFixed(1)} MB`;
  return `${(kb / 1_048_576).toFixed(1)} GB`;
};
