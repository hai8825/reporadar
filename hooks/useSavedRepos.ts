"use client";

// Saved repos live in a context (components/saved-repos-provider.tsx) so all
// consumers share one state — re-exported here so hooks import from one place.
export { useSavedRepos } from "@/components/saved-repos-provider";
