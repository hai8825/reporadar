"use client";

import { useQuery } from "@apollo/client";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { ActivityBadge } from "@/components/activity-badge";
import { BookmarkIcon, ForkIcon, StarIcon } from "@/components/icons";
import { LanguageBar } from "@/components/language-bar";
import { useReportRateLimit } from "@/components/providers";
import { useSavedRepos } from "@/hooks/useSavedRepos";
import { REPO_DETAIL } from "@/lib/graphql/queries";
import { formatCount, formatDate, timeAgo } from "@/lib/utils/format";
import { makeReadmeUrlTransform } from "@/lib/utils/readme";

type RepoDetailClientProps = {
  owner: string;
  name: string;
};

export const RepoDetailClient = ({ owner, name }: RepoDetailClientProps) => {
  const { isSaved, toggleSave } = useSavedRepos();

  const { data, loading, error } = useQuery(REPO_DETAIL, {
    variables: { owner, name },
  });

  useReportRateLimit(data?.rateLimit);

  if (loading) {
    return (
      <div className="flex flex-col gap-4" aria-busy>
        <div className="h-32 animate-pulse rounded-lg bg-background-secondary" />
        <div className="h-96 animate-pulse rounded-lg bg-background-secondary" />
      </div>
    );
  }

  const repo = data?.repository;
  if (error || !repo) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-text-secondary">
          {error ? `GitHub error: ${error.message}` : `${owner}/${name} was not found.`}
        </p>
        <Link href="/" className="text-sm text-accent-violet hover:underline">
          Back to discovery →
        </Link>
      </div>
    );
  }

  const commits =
    repo.defaultBranchRef?.target?.history.nodes?.filter(Boolean) ?? [];
  const issues = repo.issues.nodes ?? [];

  // READMEs are raw markdown — rewrite relative image/link paths to GitHub so
  // they don't 404 against our origin (see makeReadmeUrlTransform).
  const transformReadmeUrl = makeReadmeUrlTransform({
    owner,
    name,
    branch: repo.defaultBranchRef?.name ?? "HEAD",
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl text-text-primary">
            {repo.nameWithOwner}
          </h1>
          <ActivityBadge pushedAt={repo.pushedAt} isArchived={repo.isArchived} />
          <button
            type="button"
            onClick={() => toggleSave({ id: repo.id, nameWithOwner: repo.nameWithOwner })}
            aria-pressed={isSaved(repo.id)}
            className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-xs transition-colors ${
              isSaved(repo.id)
                ? "border-accent-violet bg-accent-violet-muted text-accent-chip"
                : "border-background-tertiary text-text-secondary hover:border-accent-violet-border hover:text-accent-violet"
            }`}
          >
            <BookmarkIcon className="h-3.5 w-3.5" filled={isSaved(repo.id)} />
            {isSaved(repo.id) ? "Saved" : "Save"}
          </button>
          {repo.isArchived && (
            <span className="rounded-full border border-activity-inactive/50 px-2.5 py-0.5 text-xs text-activity-inactive">
              Archived
            </span>
          )}
        </div>
        {repo.description && (
          <p className="max-w-3xl break-words text-sm text-text-secondary">
            {repo.description}
          </p>
        )}

        {/* Stats row */}
        <div className="flex flex-wrap gap-3">
          <StatCard
            label="Stars"
            value={
              <span className="inline-flex items-center gap-1.5 text-accent-amber">
                <StarIcon className="h-4 w-4" />
                {formatCount(repo.stargazerCount)}
              </span>
            }
          />
          <StatCard
            label="Forks"
            value={
              <span className="inline-flex items-center gap-1.5">
                <ForkIcon className="h-4 w-4" />
                {formatCount(repo.forkCount)}
              </span>
            }
          />
          <StatCard label="Watchers" value={formatCount(repo.watchers.totalCount)} />
          <StatCard label="Open issues" value={formatCount(repo.openIssues.totalCount)} />
          <StatCard label="Open PRs" value={formatCount(repo.openPullRequests.totalCount)} />
          <StatCard
            label="Good first issues"
            value={formatCount(repo.goodFirstIssues.totalCount)}
          />
        </div>

        {/* GitHub links */}
        <div className="flex flex-wrap gap-4 text-sm">
          {[
            { label: "Repo", href: repo.url },
            { label: "Issues", href: `${repo.url}/issues` },
            { label: "Pull requests", href: `${repo.url}/pulls` },
            { label: "Discussions", href: `${repo.url}/discussions` },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-violet hover:underline"
            >
              {label} ↗
            </a>
          ))}
        </div>

        {repo.languages && <LanguageBar languages={repo.languages} />}
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* README */}
        <section className="min-w-0 rounded-lg border-[0.5px] border-accent-violet-border bg-background-secondary p-6">
          <h2 className="mb-4 font-display text-lg text-text-primary">README</h2>
          {repo.readme?.text ? (
            <div className="readme-prose text-sm leading-relaxed text-text-secondary">
              {/* rehype-raw renders the HTML embedded in most READMEs;
                  rehype-sanitize (GitHub-style schema) strips anything
                  dangerous — these are untrusted third-party documents */}
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                urlTransform={transformReadmeUrl}
              >
                {repo.readme.text}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-text-muted">No README.md on the default branch.</p>
          )}
        </section>

        <aside className="flex flex-col gap-6">
          {/* Recent commits */}
          <section className="rounded-lg border-[0.5px] border-accent-violet-border bg-background-secondary p-5">
            <h2 className="mb-3 font-display text-base text-text-primary">
              Recent commits
            </h2>
            {commits.length === 0 ? (
              <p className="text-sm text-text-muted">No commit history available.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {commits.map((commit) => (
                  <li key={commit.oid} className="text-sm">
                    <a
                      href={commit.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="line-clamp-2 text-text-primary hover:text-accent-violet"
                    >
                      {commit.messageHeadline}
                    </a>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {commit.author?.name ?? "unknown"} · {timeAgo(commit.committedDate)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Open issues */}
          <section className="rounded-lg border-[0.5px] border-accent-violet-border bg-background-secondary p-5">
            <h2 className="mb-3 font-display text-base text-text-primary">Open issues</h2>
            {issues.length === 0 ? (
              <p className="text-sm text-text-muted">No open issues. Suspiciously tidy.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {issues.map((issue) => (
                  <li key={issue.id} className="text-sm">
                    <a
                      href={issue.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="line-clamp-2 text-text-primary hover:text-accent-violet"
                    >
                      <span className="font-mono text-text-muted">#{issue.number}</span>{" "}
                      {issue.title}
                    </a>
                    <p className="mt-0.5 text-xs text-text-muted">
                      opened {formatDate(issue.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
};

const StatCard = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex min-w-[7rem] flex-col gap-1 rounded-lg border-[0.5px] border-accent-violet-border bg-background-secondary px-4 py-3">
    <span className="text-xs uppercase tracking-wide text-text-muted">{label}</span>
    <span className="font-mono text-lg text-text-primary">{value}</span>
  </div>
);
