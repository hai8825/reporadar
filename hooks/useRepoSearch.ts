"use client";

import { NetworkStatus, useQuery } from "@apollo/client";
import { useSession } from "next-auth/react";
import { useCallback, useMemo } from "react";
import { useReportRateLimit } from "@/components/providers";
import { SEARCH_REPOS } from "@/lib/graphql/queries";
import type { RepoCardData, SearchFilters } from "@/lib/types";
import { buildSearchQuery } from "@/lib/utils/search";
import { useDebouncedValue } from "./useDebouncedValue";

// 12 fills exactly 4 rows on the 3-col desktop grid and 6 on the 2-col tablet
// grid — no half-empty last row at any breakpoint. Also the "Load more" step.
const PAGE_SIZE = 12;
const DEBOUNCE_MS = 300;

type RepoSearchResult = {
  repos: RepoCardData[];
  totalCount: number;
  loading: boolean; // initial load / new query
  loadingMore: boolean; // fetchMore in flight
  error: Error | undefined;
  hasNextPage: boolean;
  loadMore: () => void;
};

/**
 * Owns the search lifecycle: filters → debounced query string → paginated
 * Apollo query. Pages never talk to Apollo directly.
 */
export const useRepoSearch = (filters: SearchFilters): RepoSearchResult => {
  const { data: session } = useSession();

  const query = useMemo(() => buildSearchQuery(filters), [filters]);
  const debouncedQuery = useDebouncedValue(query, DEBOUNCE_MS);

  const { data, error, networkStatus, fetchMore } = useQuery(SEARCH_REPOS, {
    variables: { query: debouncedQuery, first: PAGE_SIZE },
    skip: !session?.accessToken,
    notifyOnNetworkStatusChange: true, // so fetchMore flips networkStatus
  });

  useReportRateLimit(data?.rateLimit);

  const endCursor = data?.search.pageInfo.endCursor;

  const loadMore = useCallback(() => {
    if (!endCursor) return;
    // Cache type policy appends the new page's edges (see lib/apollo.ts)
    void fetchMore({ variables: { after: endCursor } });
  }, [fetchMore, endCursor]);

  const repos = useMemo(
    () =>
      (data?.search.edges ?? [])
        .map((edge) => edge?.node)
        .filter((node): node is RepoCardData => Boolean(node?.id)),
    [data],
  );

  return {
    repos,
    totalCount: data?.search.repositoryCount ?? 0,
    loading: networkStatus === NetworkStatus.loading || networkStatus === NetworkStatus.setVariables,
    loadingMore: networkStatus === NetworkStatus.fetchMore,
    error,
    hasNextPage: data?.search.pageInfo.hasNextPage ?? false,
    loadMore,
  };
};
