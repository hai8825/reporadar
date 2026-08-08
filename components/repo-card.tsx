"use client";

import Link from "next/link";
import type { FragmentType } from "@/gql";
import { useComparison } from "@/hooks/useComparison";
import { useSavedRepos } from "@/hooks/useSavedRepos";
import { REPO_CARD_FRAGMENT } from "@/lib/graphql/fragments";
import { unmask } from "@/lib/graphql/unmask";
import type { ViewMode } from "@/hooks/useViewMode";
import { formatCount } from "@/lib/utils/format";
import { type ActivityLevel, getActivityLevel } from "@/lib/utils/activity";
import { ActivityBadge } from "./activity-badge";
import { BookmarkIcon, CompareIcon, ForkIcon, SparkleIcon, StarIcon } from "./icons";
import { SavedRepoTools } from "./saved-repo-tools";

// Status-coloured cap on each card — doubles as the brand signal (active repos
// dominate listings, so most caps render ember) and a quick status read.
const CAP_CLASS: Record<ActivityLevel, string> = {
  active: "bg-activity-active",
  maintained: "bg-activity-maintained",
  slow: "bg-activity-slow",
  inactive: "bg-activity-inactive",
};

type RepoCardProps = {
  /** Anything carrying the RepoCard fragment — the card owns its own selection */
  repo: FragmentType<typeof REPO_CARD_FRAGMENT>;
  view?: ViewMode;
  /** Collection page: render the folder picker + tag editor footer */
  savedTools?: boolean;
};

export const RepoCard = ({ repo: repoFragment, view = "tile", savedTools }: RepoCardProps) => {
  const repo = unmask(REPO_CARD_FRAGMENT, repoFragment);
  const { isSaved, toggleSave } = useSavedRepos();
  const { isStaged, canStage, toggleStaged } = useComparison();

  const saved = isSaved(repo.id);
  const staged = isStaged(repo.id);
  const isBeginnerFriendly = repo.goodFirstIssues.totalCount > 0;
  const isList = view === "list";
  const cap = CAP_CLASS[getActivityLevel(repo.pushedAt, repo.isArchived).level];

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
            ? "bg-accent-violet-muted text-accent-chip opacity-100"
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

      <span className="inline-flex items-center gap-1 font-mono font-medium text-accent-amber">
        <StarIcon className="h-3.5 w-3.5" />
        {formatCount(repo.stargazerCount)}
      </span>

      <span className="inline-flex items-center gap-1 font-mono text-text-muted">
        <ForkIcon className="h-3.5 w-3.5" />
        {formatCount(repo.forkCount)}
      </span>

      <ActivityBadge pushedAt={repo.pushedAt} isArchived={repo.isArchived} />

      {isBeginnerFriendly && (
        <span className="inline-flex items-center gap-1 rounded-full border border-background-tertiary px-2 py-0.5 text-text-secondary">
          <SparkleIcon className="h-3 w-3" />
          good first issues
        </span>
      )}
    </div>
  );

  // Dim the owner, keep the repo name in ember (the readable accent-chip tone)
  const slash = repo.nameWithOwner.indexOf("/");
  const ownerPart = slash >= 0 ? repo.nameWithOwner.slice(0, slash + 1) : "";
  const namePart = slash >= 0 ? repo.nameWithOwner.slice(slash + 1) : repo.nameWithOwner;

  // White name, ember on hover — ember stays an accent, not a static title color
  const title = (
    <Link
      href={`/repo/${repo.nameWithOwner}`}
      className="group/repo min-w-0 font-display text-base font-medium"
    >
      <span className="break-words">
        {ownerPart && <span className="text-text-muted">{ownerPart}</span>}
        <span className="text-text-primary transition-colors group-hover/repo:text-accent-violet">
          {namePart}
        </span>
      </span>
    </Link>
  );

  // Topics as neutral outline chips, echoing the resting filter chips
  // Schema allows null entries in the connection; flatMap drops them
  const topicNames = (repo.repositoryTopics.nodes ?? [])
    .flatMap((n) => n?.topic.name ?? [])
    .slice(0, 4);
  const topicLine =
    topicNames.length > 0 ? (
      <div className="flex flex-wrap gap-1.5">
        {topicNames.map((t) => (
          <span
            key={t}
            className="rounded-full border border-background-tertiary px-2 py-0.5 text-[10px] text-text-secondary"
          >
            {t}
          </span>
        ))}
      </div>
    ) : null;

  if (isList) {
    return (
      <article className="group flex min-w-0 overflow-hidden rounded-lg bg-background-secondary shadow-card transition-shadow hover:shadow-card-hover">
        {/* Status cap — a thin status-coloured rail down the leading edge */}
        <div aria-hidden className={`w-[3px] shrink-0 ${cap}`} />
        <div className="flex min-w-0 flex-1 flex-col gap-3 px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              {title}
              {repo.description && (
                <p className="line-clamp-1 break-words text-sm text-text-secondary">
                  {repo.description}
                </p>
              )}
              {topicLine}
            </div>
            <div className="hidden md:block">{meta}</div>
            {actions}
          </div>
          <div className="md:hidden">{meta}</div>
          {savedTools && <SavedRepoTools repoId={repo.id} />}
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-lg bg-background-secondary shadow-card transition-shadow hover:shadow-card-hover">
      {/* Status cap — a thin status-coloured rail across the top edge */}
      <div aria-hidden className={`h-[3px] ${cap}`} />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          {title}
          {actions}
        </div>

        {repo.description && (
          <p className="line-clamp-2 break-words text-sm text-text-secondary">
            {repo.description}
          </p>
        )}

        {topicLine}

        {savedTools && <SavedRepoTools repoId={repo.id} />}
      </div>

      {/* Footer band — metadata on a grey lifted off the page */}
      <div className="bg-background-band px-4 py-2.5">{meta}</div>
    </article>
  );
};
