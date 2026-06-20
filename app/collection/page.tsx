"use client";

import { useQuery } from "@apollo/client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useReportRateLimit } from "@/components/providers";
import { RepoGrid } from "@/components/repo-grid";
import { ViewToggle } from "@/components/view-toggle";
import { useSavedRepos } from "@/hooks/useSavedRepos";
import { useViewMode } from "@/hooks/useViewMode";
import { SAVED_REPOS } from "@/lib/graphql/queries";
import type { RepoCardData } from "@/lib/types";
import { getActivityLevel, type ActivityLevel } from "@/lib/utils/activity";
import { FOLDER_ALL, FolderCards } from "./folder-cards";

const ACTIVITY_OPTIONS: Array<{ label: string; value: ActivityLevel }> = [
  { label: "Active", value: "active" },
  { label: "Maintained", value: "maintained" },
  { label: "Slow", value: "slow" },
  { label: "Inactive", value: "inactive" },
];

export default function CollectionPage() {
  const { saved, savedIds, allTags, folders, isReady } = useSavedRepos();
  const [view, setView] = useViewMode();
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [activeLevels, setActiveLevels] = useState<ActivityLevel[]>([]);
  const [activeFolder, setActiveFolder] = useState<string>(FOLDER_ALL);

  // Batch-fetch live GitHub data for all saved IDs — the DB only stores the id,
  // name, tags and folder, so stars/activity/etc. always come fresh from GitHub
  const { data, loading, error } = useQuery(SAVED_REPOS, {
    variables: { ids: savedIds },
    skip: !isReady || savedIds.length === 0,
    fetchPolicy: "cache-and-network", // always refresh on mount
  });

  useReportRateLimit(data?.rateLimit);

  const reposById = useMemo(() => {
    const map = new Map<string, RepoCardData>();
    for (const node of data?.nodes ?? []) {
      if (node?.id) map.set(node.id, node);
    }
    return map;
  }, [data]);

  // A deleted folder may still be selected for one render — treat as All
  const folder =
    activeFolder === FOLDER_ALL || folders.includes(activeFolder)
      ? activeFolder
      : FOLDER_ALL;

  // Filter pipeline over LIVE saved state (not query data), so unsaving,
  // moving folders, and tag edits all update the list instantly
  const repos = useMemo(() => {
    const text = query.trim().toLowerCase();

    return saved
      .filter((entry) => folder === FOLDER_ALL || entry.folder === folder)
      .filter((entry) =>
        // AND semantics: repo must carry every selected tag
        activeTags.every((tag) => entry.tags.includes(tag)),
      )
      .map((entry) => reposById.get(entry.id))
      .filter((repo): repo is RepoCardData => repo !== undefined)
      .filter(
        (repo) =>
          !text ||
          repo.nameWithOwner.toLowerCase().includes(text) ||
          (repo.description ?? "").toLowerCase().includes(text),
      )
      .filter(
        (repo) =>
          // OR semantics: any selected activity level matches
          activeLevels.length === 0 ||
          activeLevels.includes(getActivityLevel(repo.pushedAt, repo.isArchived).level),
      );
  }, [saved, folder, activeTags, reposById, query, activeLevels]);

  const toggleIn = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const hasActiveFilter =
    query.trim() !== "" ||
    activeTags.length > 0 ||
    activeLevels.length > 0 ||
    folder !== FOLDER_ALL;

  if (isReady && savedIds.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <h1 className="font-display text-2xl text-text-primary">Nothing saved yet</h1>
        <p className="max-w-sm text-sm text-text-secondary">
          Hit the bookmark on any repo card to build your collection, then
          organize repos into folders and tag them (e.g. “esp32”).
        </p>
        <Link href="/" className="mt-2 text-sm text-accent-violet hover:underline">
          Discover repos →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-text-primary">Saved repos</h1>
        <ViewToggle mode={view} onChange={setView} />
      </div>

      <FolderCards active={folder} onSelect={setActiveFolder} reposById={reposById} />

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter saved repos by name or description…"
        aria-label="Filter saved repositories"
        className="w-full rounded-lg border-[0.5px] border-accent-violet-border bg-background-secondary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-violet"
      />

      {allTags.length > 0 && (
        <section
          aria-label="Tags"
          className="rounded-lg border-[0.5px] border-accent-violet-border bg-background-secondary p-4"
        >
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-text-muted">
            Tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTags((prev) => toggleIn(prev, tag))}
                aria-pressed={activeTags.includes(tag)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  activeTags.includes(tag)
                    ? "border-accent-violet bg-accent-violet-muted text-accent-chip"
                    : "border-background-tertiary text-text-secondary hover:border-text-muted"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
          Activity
        </span>
        {ACTIVITY_OPTIONS.map(({ label, value }) => (
          <button
            key={value}
            type="button"
            onClick={() => setActiveLevels((prev) => toggleIn(prev, value))}
            aria-pressed={activeLevels.includes(value)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              activeLevels.includes(value)
                ? "border-accent-violet bg-accent-violet-muted text-accent-chip"
                : "border-background-tertiary text-text-secondary hover:border-text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <RepoGrid
        repos={repos}
        loading={!isReady || (loading && repos.length === 0 && !hasActiveFilter)}
        error={error}
        emptyMessage={
          hasActiveFilter
            ? "No saved repos match this filter."
            : "None of your saved repos could be loaded."
        }
        view={view}
        savedTools
      />
    </div>
  );
}
