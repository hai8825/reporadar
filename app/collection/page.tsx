"use client";

import { useQuery } from "@apollo/client";
import Link from "next/link";
import { useMemo } from "react";
import { useReportRateLimit } from "@/components/providers";
import { RepoGrid } from "@/components/repo-grid";
import { useSavedRepos } from "@/hooks/useSavedRepos";
import { SAVED_REPOS } from "@/lib/graphql/queries";
import type { RepoCardData } from "@/lib/types";

export default function CollectionPage() {
  const { savedIds, isReady } = useSavedRepos();

  // Batch-fetch live data for all saved IDs — never render stale localStorage fields
  const { data, loading, error } = useQuery(SAVED_REPOS, {
    variables: { ids: savedIds },
    skip: !isReady || savedIds.length === 0,
    fetchPolicy: "cache-and-network", // always refresh on mount
  });

  useReportRateLimit(data?.rateLimit);

  // nodes() preserves input order, and savedIds is already most-recent-first
  const repos = useMemo(
    () =>
      (data?.nodes ?? []).filter(
        (node): node is RepoCardData => Boolean(node?.id),
      ),
    [data],
  );

  if (isReady && savedIds.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <h1 className="font-display text-2xl text-text-primary">Nothing saved yet</h1>
        <p className="max-w-sm text-sm text-text-secondary">
          Hit the bookmark on any repo card to build your collection.
        </p>
        <Link href="/" className="mt-2 text-sm text-accent-violet hover:underline">
          Discover repos →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl text-text-primary">Saved repos</h1>
      <RepoGrid
        repos={repos}
        loading={!isReady || (loading && repos.length === 0)}
        error={error}
        emptyMessage="None of your saved repos could be loaded."
      />
    </div>
  );
}
