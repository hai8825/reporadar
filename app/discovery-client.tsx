"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { FilterPanel } from "@/components/filter-panel";
import { RepoGrid } from "@/components/repo-grid";
import { SearchBar } from "@/components/search-bar";
import { useRepoSearch } from "@/hooks/useRepoSearch";
import type { SearchFilters } from "@/lib/types";
import { filtersFromParams, filtersToParams } from "@/lib/utils/filter-params";

export const DiscoveryClient = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL is the single source of truth for filters — results are shareable
  const filters = useMemo(
    () => filtersFromParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const setFilters = useCallback(
    (next: SearchFilters) => {
      const params = filtersToParams(next).toString();
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

      {!loading && !error && (
        <p className="text-sm text-text-muted">
          {totalCount.toLocaleString()} repositories
        </p>
      )}

      <RepoGrid
        repos={repos}
        loading={loading}
        error={error}
        emptyMessage="No repositories match these filters. Try loosening them."
      />

      {hasNextPage && !loading && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loadingMore}
          className="mx-auto rounded-lg border border-accent-violet-border bg-background-secondary px-6 py-2 text-sm text-text-primary transition-colors hover:bg-background-tertiary disabled:opacity-60"
        >
          {loadingMore ? "Loading…" : "Load more"}
        </button>
      )}
    </div>
  );
};
