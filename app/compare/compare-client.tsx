"use client";

import { useQuery } from "@apollo/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ActivityBadge } from "@/components/activity-badge";
import { useReportRateLimit } from "@/components/providers";
import { COMPARE_REPOS } from "@/lib/graphql/queries";
import type { RepoDetailData } from "@/lib/types";
import { ACTIVITY_RANK, getActivityLevel } from "@/lib/utils/activity";
import { formatCount, formatDate, formatDiskSize } from "@/lib/utils/format";

// "owner/name" → [owner, name], or null if malformed
const parseRepoRef = (ref: string | null): [string, string] | null => {
  const parts = ref?.split("/") ?? [];
  return parts.length === 2 && parts[0] && parts[1]
    ? [parts[0], parts[1]]
    : null;
};

type Row = {
  label: string;
  render: (repo: RepoDetailData) => React.ReactNode;
  // Numeric score per repo; higher wins. Omit for rows with no winner (language, topics…)
  score?: (repo: RepoDetailData) => number;
};

const ROWS: Row[] = [
  {
    label: "Stars",
    render: (r) => (
      <span className="font-mono text-accent-amber">{formatCount(r.stargazerCount)}</span>
    ),
    score: (r) => r.stargazerCount,
  },
  {
    label: "Forks",
    render: (r) => <span className="font-mono">{formatCount(r.forkCount)}</span>,
    score: (r) => r.forkCount,
  },
  {
    label: "Open issues",
    render: (r) => <span className="font-mono">{formatCount(r.openIssues.totalCount)}</span>,
    score: (r) => r.openIssues.totalCount,
  },
  {
    label: "Open PRs",
    render: (r) => (
      <span className="font-mono">{formatCount(r.openPullRequests.totalCount)}</span>
    ),
    score: (r) => r.openPullRequests.totalCount,
  },
  {
    label: "Good first issues",
    render: (r) => (
      <span className="font-mono">{formatCount(r.goodFirstIssues.totalCount)}</span>
    ),
    score: (r) => r.goodFirstIssues.totalCount,
  },
  {
    label: "Language",
    render: (r) =>
      r.primaryLanguage ? (
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: r.primaryLanguage.color ?? "#6B7280" }}
          />
          {r.primaryLanguage.name}
        </span>
      ) : (
        "—"
      ),
  },
  {
    label: "License",
    render: (r) => r.licenseInfo?.spdxId ?? r.licenseInfo?.name ?? "—",
  },
  {
    label: "Last push",
    render: (r) => (r.pushedAt ? formatDate(r.pushedAt) : "—"),
    score: (r) => (r.pushedAt ? new Date(r.pushedAt).getTime() : 0), // more recent wins
  },
  {
    label: "Activity",
    render: (r) => <ActivityBadge pushedAt={r.pushedAt} isArchived={r.isArchived} />,
    score: (r) => ACTIVITY_RANK[getActivityLevel(r.pushedAt, r.isArchived).level],
  },
  {
    label: "Topics",
    render: (r) => {
      const topics = (r.repositoryTopics.nodes ?? []).map((n) => n.topic.name);
      return topics.length ? (
        <span className="flex flex-wrap justify-center gap-1.5">
          {topics.map((t) => (
            <span
              key={t}
              className="rounded-full border border-accent-violet-border bg-accent-violet-muted px-2 py-0.5 text-xs text-accent-violet"
            >
              {t}
            </span>
          ))}
        </span>
      ) : (
        "—"
      );
    },
  },
  {
    label: "Disk size",
    render: (r) => <span className="font-mono">{formatDiskSize(r.diskUsage)}</span>,
  },
];

export const CompareClient = () => {
  const searchParams = useSearchParams();

  const refA = parseRepoRef(searchParams.get("a"));
  const refB = parseRepoRef(searchParams.get("b"));
  const valid = Boolean(refA && refB);

  // Destructure with fallbacks so variables are always well-typed; skip guards the fetch
  const [owner1, name1] = refA ?? ["", ""];
  const [owner2, name2] = refB ?? ["", ""];

  const { data, loading, error } = useQuery(COMPARE_REPOS, {
    variables: { owner1, name1, owner2, name2 },
    skip: !valid,
  });

  useReportRateLimit(data?.rateLimit);

  if (!valid) {
    return (
      <CompareMessage>
        Pick two repos to compare — the URL needs <code>?a=owner/name&b=owner/name</code>.
      </CompareMessage>
    );
  }
  if (loading) {
    return (
      <div className="h-96 animate-pulse rounded-lg border-[0.5px] border-accent-violet-border bg-background-secondary" />
    );
  }
  if (error) return <CompareMessage>GitHub error: {error.message}</CompareMessage>;

  const { repoA, repoB } = data ?? {};
  if (!repoA || !repoB) {
    return (
      <CompareMessage>
        {!repoA && <>Repo <strong>{searchParams.get("a")}</strong> was not found. </>}
        {!repoB && <>Repo <strong>{searchParams.get("b")}</strong> was not found.</>}
      </CompareMessage>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl text-text-primary">Compare</h1>

      <div className="overflow-x-auto rounded-lg border-[0.5px] border-accent-violet-border">
        <table className="w-full border-collapse bg-background-secondary text-sm">
          <thead>
            <tr className="border-b border-accent-violet-border">
              <th className="w-44 p-4" />
              {[repoA, repoB].map((repo) => (
                <th key={repo.id} className="p-4 text-center">
                  <Link
                    href={`/repo/${repo.nameWithOwner}`}
                    className="font-display text-base font-medium text-text-primary hover:text-accent-violet"
                  >
                    {repo.nameWithOwner}
                  </Link>
                  {repo.description && (
                    <p className="mt-1 line-clamp-2 break-words text-xs font-normal text-text-secondary">
                      {repo.description}
                    </p>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => {
              const scoreA = row.score?.(repoA);
              const scoreB = row.score?.(repoB);
              const winner =
                scoreA !== undefined && scoreB !== undefined && scoreA !== scoreB
                  ? scoreA > scoreB
                    ? "a"
                    : "b"
                  : null;

              return (
                <tr key={row.label} className={i % 2 ? "bg-background-tertiary/40" : ""}>
                  <td className="p-4 text-xs font-medium uppercase tracking-wide text-text-muted">
                    {row.label}
                  </td>
                  <td
                    className={`p-4 text-center text-text-primary ${
                      winner === "a" ? "bg-accent-violet-muted" : ""
                    }`}
                  >
                    {row.render(repoA)}
                  </td>
                  <td
                    className={`p-4 text-center text-text-primary ${
                      winner === "b" ? "bg-accent-violet-muted" : ""
                    }`}
                  >
                    {row.render(repoB)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CompareMessage = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
    <p className="max-w-md text-sm text-text-secondary">{children}</p>
    <Link href="/" className="text-sm text-accent-violet hover:underline">
      Back to discovery →
    </Link>
  </div>
);
