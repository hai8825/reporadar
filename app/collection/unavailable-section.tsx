"use client";

import type { SavedRepo } from "@/lib/types";
import {
  daysUntilArchive,
  UNAVAILABLE_GRACE_DAYS,
} from "@/lib/utils/availability";

// Renders the repos GitHub can no longer resolve — either still in their grace
// period ("unavailable") or already archived. Both are shown from locally
// stored data (name/tags/folder), since GitHub returns nothing for them.

type Props = {
  variant: "unavailable" | "archived";
  repos: SavedRepo[];
  onRemove: (id: string) => void;
  onRestore?: (id: string) => void;
};

const COPY = {
  unavailable: {
    title: "Unavailable",
    hint: `GitHub can't resolve these right now — deleted, or gone private / access lost. They auto-archive after ${UNAVAILABLE_GRACE_DAYS} days unavailable.`,
  },
  archived: {
    title: "Archived",
    hint: "Kept for reference and no longer checked against GitHub. Restore to re-check on the next load.",
  },
} as const;

// Short, locale-aware date for the status line
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export const UnavailableSection = ({
  variant,
  repos,
  onRemove,
  onRestore,
}: Props) => {
  if (repos.length === 0) return null;
  const { title, hint } = COPY[variant];

  return (
    <section
      aria-label={title}
      className="rounded-lg border-[0.5px] border-accent-violet-border bg-background-secondary p-4"
    >
      <h2 className="text-sm font-medium text-text-primary">
        {title}{" "}
        <span className="text-text-muted">({repos.length})</span>
      </h2>
      <p className="mt-1 text-xs text-text-muted">{hint}</p>

      <ul className="mt-3 flex flex-col gap-2">
        {repos.map((repo) => {
          // Status line differs per bucket: countdown vs. archived-on date
          const status =
            variant === "unavailable" && repo.unavailableSince
              ? `Unavailable since ${formatDate(repo.unavailableSince)} · auto-archives in ${daysUntilArchive(repo.unavailableSince)} days`
              : variant === "archived" && repo.archivedAt
                ? `Archived ${formatDate(repo.archivedAt)}`
                : "Unavailable";

          return (
            <li
              key={repo.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-background-tertiary px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-text-primary">
                  {repo.nameWithOwner}
                </p>
                <p className="text-xs text-text-muted">
                  {status}
                  {repo.folder ? ` · ${repo.folder}` : ""}
                  {repo.tags.length ? ` · ${repo.tags.join(", ")}` : ""}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                {variant === "archived" && onRestore && (
                  <button
                    type="button"
                    onClick={() => onRestore(repo.id)}
                    aria-label={`Restore ${repo.nameWithOwner}`}
                    className="rounded-full border border-background-tertiary px-3 py-1 text-xs text-text-secondary transition-colors hover:border-text-muted"
                  >
                    Restore
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onRemove(repo.id)}
                  aria-label={`Remove ${repo.nameWithOwner} from your collection`}
                  className="rounded-full border border-background-tertiary px-3 py-1 text-xs text-text-secondary transition-colors hover:border-accent-violet hover:text-accent-chip"
                >
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
