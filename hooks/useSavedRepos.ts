"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { SavedRepo } from "@/lib/types";

const storageKey = (userId: string) => `reporadar:saved:${userId}`;

const readSaved = (userId: string): SavedRepo[] => {
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    return raw ? (JSON.parse(raw) as SavedRepo[]) : [];
  } catch {
    // Corrupt JSON or storage disabled — treat as empty rather than crash
    return [];
  }
};

type SavedReposResult = {
  saved: SavedRepo[]; // sorted most recently saved first
  savedIds: string[];
  isSaved: (id: string) => boolean;
  toggleSave: (repo: { id: string; nameWithOwner: string }) => void;
  isReady: boolean; // false until localStorage has been read on the client
};

/**
 * Save/unsave persisted per GitHub user in localStorage. The collection page
 * uses `savedIds` to batch-fetch live data — stale stored fields are never rendered.
 */
export const useSavedRepos = (): SavedReposResult => {
  const { data: session } = useSession();
  const userId = session?.user.id ?? "";

  const [saved, setSaved] = useState<SavedRepo[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Hydrate from localStorage once the session (and thus the key) is known
  useEffect(() => {
    if (!userId) return;
    setSaved(readSaved(userId));
    setIsReady(true);
  }, [userId]);

  const toggleSave = useCallback(
    (repo: { id: string; nameWithOwner: string }) => {
      if (!userId) return;
      setSaved((prev) => {
        const next = prev.some((r) => r.id === repo.id)
          ? prev.filter((r) => r.id !== repo.id)
          : [...prev, { ...repo, savedAt: new Date().toISOString() }];
        window.localStorage.setItem(storageKey(userId), JSON.stringify(next));
        return next;
      });
    },
    [userId],
  );

  const sorted = useMemo(
    () => [...saved].sort((a, b) => b.savedAt.localeCompare(a.savedAt)),
    [saved],
  );

  return {
    saved: sorted,
    savedIds: useMemo(() => sorted.map((r) => r.id), [sorted]),
    isSaved: useCallback((id: string) => saved.some((r) => r.id === id), [saved]),
    toggleSave,
    isReady,
  };
};
