"use client";

import type { ViewMode } from "@/hooks/useViewMode";
import type { RepoCardData } from "@/lib/types";
import { RepoCard } from "./repo-card";

type RepoGridProps = {
  repos: RepoCardData[];
  loading?: boolean;
  error?: Error;
  emptyMessage: string;
  view?: ViewMode;
  /** repo id → tags; presence enables the tag editor on each card */
  tagsById?: Record<string, string[]>;
};

// Shared grid for / and /collection: skeletons → error → empty → cards
export const RepoGrid = ({
  repos,
  loading,
  error,
  emptyMessage,
  view = "tile",
  tagsById,
}: RepoGridProps) => {
  const layout =
    view === "list"
      ? "flex flex-col gap-3"
      : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";

  if (loading) {
    return (
      <div className={layout} aria-busy>
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className={`animate-pulse rounded-lg border-[0.5px] border-accent-violet-border bg-background-secondary ${
              view === "list" ? "h-16" : "h-36"
            }`}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border-[0.5px] border-accent-violet-border bg-background-secondary p-8 text-center">
        <p className="text-sm text-text-secondary">Something went wrong talking to GitHub.</p>
        <p className="mt-2 font-mono text-xs text-text-muted">{error.message}</p>
      </div>
    );
  }

  if (repos.length === 0) {
    return (
      <div className="rounded-lg border-[0.5px] border-accent-violet-border bg-background-secondary p-12 text-center">
        <p className="text-sm text-text-secondary">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={layout}>
      {repos.map((repo) => (
        <RepoCard
          key={repo.id}
          repo={repo}
          view={view}
          tags={tagsById ? tagsById[repo.id] ?? [] : undefined}
        />
      ))}
    </div>
  );
};
