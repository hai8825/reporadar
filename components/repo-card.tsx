"use client";

import Link from "next/link";
import { useComparison } from "@/hooks/useComparison";
import { useSavedRepos } from "@/hooks/useSavedRepos";
import type { RepoCardData } from "@/lib/types";
import type { ViewMode } from "@/hooks/useViewMode";
import { formatCount } from "@/lib/utils/format";
import { ActivityBadge } from "./activity-badge";
import { BookmarkIcon, CompareIcon, ForkIcon, StarIcon } from "./icons";
import { SavedRepoTools } from "./saved-repo-tools";

type RepoCardProps = {
  repo: RepoCardData;
  view?: ViewMode;
  /** Collection page: render the folder picker + tag editor footer */
  savedTools?: boolean;
};

export const RepoCard = ({ repo, view = "tile", savedTools }: RepoCardProps) => {
  const { isSaved, toggleSave } = useSavedRepos();
  const { isStaged, canStage, toggleStaged } = useComparison();

  const saved = isSaved(repo.id);
  const staged = isStaged(repo.id);
  const isBeginnerFriendly = repo.goodFirstIssues.totalCount > 0;
  const isList = view === "list";

  const actions = (
    <div className="flex shrink-0 items-center gap-1">
      {/* Compare: hidden until hover unless already staged */}
      <button
        type="button"
        onClick={() => toggleStaged({ id: repo.id, nameWithOwner: repo.nameWithOwner })}
        disabled={!staged && !canStage}
        aria-label={
          staged
            ? `Remove ${repo.nameWithOwner} from comparison`
            : `Compare ${repo.nameWithOwner}`
        }
        aria-pressed={staged}
        title={!staged && !canStage ? "Two repos already selected" : "Compare"}
        className={`rounded p-1.5 transition-opacity focus-visible:opacity-100 ${
          staged
            ? "bg-accent-violet-muted text-accent-violet opacity-100"
            : "text-text-muted opacity-0 hover:text-accent-violet group-hover:opacity-100 disabled:cursor-not-allowed disabled:hover:text-text-muted"
        }`}
      >
        <CompareIcon className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => toggleSave({ id: repo.id, nameWithOwner: repo.nameWithOwner })}
        aria-label={saved ? `Unsave ${repo.nameWithOwner}` : `Save ${repo.nameWithOwner}`}
        aria-pressed={saved}
        className={`rounded p-1.5 ${
          saved ? "text-accent-violet" : "text-text-muted hover:text-accent-violet"
        }`}
      >
        <BookmarkIcon className="h-4 w-4" filled={saved} />
      </button>
    </div>
  );

  const meta = (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
      {repo.primaryLanguage && (
        <span className="inline-flex items-center gap-1.5 text-text-secondary">
          {/* API-provided color — intentionally an inline style, not a Tailwind class */}
          <span
            aria-hidden
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: repo.primaryLanguage.color ?? "#6B7280" }}
          />
          {repo.primaryLanguage.name}
        </span>
      )}

      <span className="inline-flex items-center gap-1 font-mono text-accent-amber">
        <StarIcon className="h-3.5 w-3.5" />
        {formatCount(repo.stargazerCount)}
      </span>

      <span className="inline-flex items-center gap-1 font-mono text-text-muted">
        <ForkIcon className="h-3.5 w-3.5" />
        {formatCount(repo.forkCount)}
      </span>

      <ActivityBadge pushedAt={repo.pushedAt} isArchived={repo.isArchived} />

      {isBeginnerFriendly && (
        <span className="rounded-full border border-accent-violet-border bg-accent-violet-muted px-2 py-0.5 text-accent-violet">
          beginner friendly
        </span>
      )}
    </div>
  );

  const title = (
    <Link
      href={`/repo/${repo.nameWithOwner}`}
      className="min-w-0 font-display text-base font-medium text-text-primary hover:text-accent-violet"
    >
      <span className="break-words">{repo.nameWithOwner}</span>
    </Link>
  );

  if (isList) {
    return (
      <article className="group flex min-w-0 flex-col gap-3 rounded-lg bg-background-secondary px-4 py-3 shadow-card transition-shadow hover:shadow-card-hover">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            {title}
            {repo.description && (
              <p className="line-clamp-1 break-words text-sm text-text-secondary">
                {repo.description}
              </p>
            )}
          </div>
          <div className="hidden md:block">{meta}</div>
          {actions}
        </div>
        <div className="md:hidden">{meta}</div>
        {savedTools && <SavedRepoTools repoId={repo.id} />}
      </article>
    );
  }

  return (
    <article className="group relative flex min-w-0 flex-col gap-3 rounded-lg bg-background-secondary p-4 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-2">
        {title}
        {actions}
      </div>

      {repo.description && (
        <p className="line-clamp-2 break-words text-sm text-text-secondary">
          {repo.description}
        </p>
      )}

      <div className="mt-auto">{meta}</div>

      {savedTools && <SavedRepoTools repoId={repo.id} />}
    </article>
  );
};
