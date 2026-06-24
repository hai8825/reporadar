"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { FilterPanel } from "@/components/filter-panel";
import { RepoGrid } from "@/components/repo-grid";
import { SearchBar } from "@/components/search-bar";
import { ViewToggle } from "@/components/view-toggle";
import { useRepoSearch } from "@/hooks/useRepoSearch";
import { useViewMode } from "@/hooks/useViewMode";
import type { SearchFilters } from "@/lib/types";
import { filtersFromParams, filtersToParams } from "@/lib/utils/filter-params";

// Filters live in the URL (shareable), but navigating to /collection and back
// drops the params — so the last search is mirrored to sessionStorage and
// restored when the page mounts bare.
const LAST_SEARCH_KEY = "reporadar:lastSearch";

export const DiscoveryClient = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [view, setView] = useViewMode();

  // URL is the single source of truth for filters — results are shareable
  const filters = useMemo(
    () => filtersFromParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  // Restore the previous session's search exactly once, only on a bare URL
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    const last = window.sessionStorage.getItem(LAST_SEARCH_KEY);
    if (last && searchParams.toString() === "") {
      router.replace(`${pathname}?${last}`, { scroll: false });
    }
  }, [router, pathname, searchParams]);

  const setFilters = useCallback(
    (next: SearchFilters) => {
      const params = filtersToParams(next).toString();
      window.sessionStorage.setItem(LAST_SEARCH_KEY, params);
      router.replace(params ? `${pathname}?${params}` : pathname, {
        scroll: false,
      });
    },
    [router, pathname],
  );

  const { repos, totalCount, loading, loadingMore, error, hasNextPage, loadMore } =
    useRepoSearch(filters);

  return (
    <div className="flex flex-col gap-4">
      <SearchBar
        value={filters.text}
        onChange={(text) => setFilters({ ...filters, text })}
      />
      <FilterPanel filters={filters} onChange={setFilters} />

      <div className="flex items-center justify-between">
        {!loading && !error ? (
          <p className="text-sm text-text-muted">
            {totalCount.toLocaleString()} repositories
          </p>
        ) : (
          <span />
        )}
        <ViewToggle mode={view} onChange={setView} />
      </div>

      <RepoGrid
        repos={repos}
        loading={loading}
        error={error}
        emptyMessage="No repositories match these filters. Try loosening them."
        view={view}
      />

      {hasNextPage && !loading && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loadingMore}
          className="mx-auto mt-4 rounded-lg bg-background-secondary px-7 py-2.5 text-sm font-medium text-text-primary shadow-card transition-colors hover:bg-background-tertiary disabled:opacity-60"
        >
          {loadingMore ? "Loading…" : "Load more"}
        </button>
      )}
    </div>
  );
};
