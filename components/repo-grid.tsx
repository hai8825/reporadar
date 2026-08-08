"use client";

import type { FragmentType } from "@/gql";
import type { ViewMode } from "@/hooks/useViewMode";
import { REPO_CARD_FRAGMENT } from "@/lib/graphql/fragments";
import { unmask } from "@/lib/graphql/unmask";
import { RepoCard } from "./repo-card";

type RepoGridProps = {
  repos: Array<FragmentType<typeof REPO_CARD_FRAGMENT>>;
  loading?: boolean;
  error?: Error;
  emptyMessage: string;
  view?: ViewMode;
  /** Collection page: enable the folder picker + tag editor on each card */
  savedTools?: boolean;
};

// Shared grid for / and /collection: skeletons → error → empty → cards
export const RepoGrid = ({
  repos,
  loading,
  error,
  emptyMessage,
  view = "tile",
  savedTools,
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
            className={`animate-pulse rounded-lg bg-background-secondary shadow-card ${
              view === "list" ? "h-16" : "h-36"
            }`}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-background-secondary p-8 text-center shadow-card">
        <p className="text-sm text-text-secondary">Something went wrong talking to GitHub.</p>
        <p className="mt-2 font-mono text-xs text-text-muted">{error.message}</p>
      </div>
    );
  }

  if (repos.length === 0) {
    return (
      <div className="rounded-lg bg-background-secondary p-12 text-center shadow-card">
        <p className="text-sm text-text-secondary">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={layout}>
      {repos.map((repo) => {
        // Cards stay masked on the way down; the grid only needs the key
        const { id } = unmask(REPO_CARD_FRAGMENT, repo);
        return <RepoCard key={id} repo={repo} view={view} savedTools={savedTools} />;
      })}
    </div>
  );
};
