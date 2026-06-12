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

export default function CollectionPage() {
  const { saved, savedIds, allTags, isReady } = useSavedRepos();
  const [view, setView] = useViewMode();
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);

  // Batch-fetch live data for all saved IDs — never render stale localStorage fields
  const { data, loading, error } = useQuery(SAVED_REPOS, {
    variables: { ids: savedIds },
    skip: !isReady || savedIds.length === 0,
    fetchPolicy: "cache-and-network", // always refresh on mount
  });

  useReportRateLimit(data?.rateLimit);

  const tagsById = useMemo(
    () => Object.fromEntries(saved.map((r) => [r.id, r.tags])),
    [saved],
  );

  const repos = useMemo(() => {
    const idSet = new Set(savedIds); // filter against live state → unsave removes instantly
    const text = query.trim().toLowerCase();

    return (data?.nodes ?? [])
      .filter((node): node is RepoCardData => node != null && idSet.has(node.id))
      .filter(
        (repo) =>
          !text ||
          repo.nameWithOwner.toLowerCase().includes(text) ||
          (repo.description ?? "").toLowerCase().includes(text),
      )
      .filter((repo) =>
        // AND semantics: repo must carry every selected tag
        activeTags.every((tag) => (tagsById[repo.id] ?? []).includes(tag)),
      )
      .sort((a, b) => savedIds.indexOf(a.id) - savedIds.indexOf(b.id));
  }, [data, savedIds, query, activeTags, tagsById]);

  const toggleTag = (tag: string) =>
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  if (isReady && savedIds.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <h1 className="font-display text-2xl text-text-primary">Nothing saved yet</h1>
        <p className="max-w-sm text-sm text-text-secondary">
          Hit the bookmark on any repo card to build your collection, then tag
          repos to group them (e.g. “esp32”).
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

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter saved repos by name or description…"
        aria-label="Filter saved repositories"
        className="w-full rounded-lg border-[0.5px] border-accent-violet-border bg-background-secondary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-violet"
      />

      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
            Tags
          </span>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              aria-pressed={activeTags.includes(tag)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                activeTags.includes(tag)
                  ? "border-accent-violet bg-accent-violet-muted text-accent-violet"
                  : "border-background-tertiary text-text-secondary hover:border-text-muted"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <RepoGrid
        repos={repos}
        loading={!isReady || (loading && repos.length === 0 && !query && activeTags.length === 0)}
        error={error}
        emptyMessage={
          query || activeTags.length
            ? "No saved repos match this filter."
            : "None of your saved repos could be loaded."
        }
        view={view}
        tagsById={tagsById}
      />
    </div>
  );
}
