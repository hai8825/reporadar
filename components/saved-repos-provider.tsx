"use client";

import { useSession } from "next-auth/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { SavedRepo } from "@/lib/types";

// Saved repos live in ONE context so every consumer (cards, detail page,
// collection) sees the same state instantly — per-hook localStorage reads
// caused unsaves in one component to go unnoticed in another.

const storageKey = (userId: string) => `reporadar:saved:${userId}`;

const readSaved = (userId: string): SavedRepo[] => {
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<Partial<SavedRepo>>;
    // Migrate entries saved before tags existed
    return parsed
      .filter((r): r is SavedRepo & Partial<SavedRepo> =>
        Boolean(r.id && r.nameWithOwner && r.savedAt),
      )
      .map((r) => ({ ...r, tags: r.tags ?? [] }));
  } catch {
    // Corrupt JSON or storage disabled — treat as empty rather than crash
    return [];
  }
};

// Normalize freeform tag input: trim, collapse whitespace to dashes, lowercase
export const normalizeTag = (tag: string): string =>
  tag.trim().toLowerCase().replace(/\s+/g, "-");

type SavedReposContextValue = {
  saved: SavedRepo[]; // sorted most recently saved first
  savedIds: string[];
  allTags: string[]; // distinct tags across the collection, sorted
  isReady: boolean; // false until localStorage has been read on the client
  isSaved: (id: string) => boolean;
  toggleSave: (repo: { id: string; nameWithOwner: string }) => void;
  addTag: (repoId: string, tag: string) => void;
  removeTag: (repoId: string, tag: string) => void;
};

const SavedReposContext = createContext<SavedReposContextValue | null>(null);

export const useSavedRepos = (): SavedReposContextValue => {
  const ctx = useContext(SavedReposContext);
  if (!ctx) throw new Error("useSavedRepos must be used within <Providers>");
  return ctx;
};

export const SavedReposProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data: session } = useSession();
  const userId = session?.user.id ?? "";

  const [saved, setSaved] = useState<SavedRepo[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Hydrate once the session (and thus the storage key) is known
  useEffect(() => {
    if (!userId) return;
    setSaved(readSaved(userId));
    setIsReady(true);
  }, [userId]);

  // Single write path: every mutation goes through here and persists
  const mutate = useCallback(
    (update: (prev: SavedRepo[]) => SavedRepo[]) => {
      if (!userId) return;
      setSaved((prev) => {
        const next = update(prev);
        window.localStorage.setItem(storageKey(userId), JSON.stringify(next));
        return next;
      });
    },
    [userId],
  );

  const toggleSave = useCallback(
    (repo: { id: string; nameWithOwner: string }) =>
      mutate((prev) =>
        prev.some((r) => r.id === repo.id)
          ? prev.filter((r) => r.id !== repo.id)
          : [...prev, { ...repo, savedAt: new Date().toISOString(), tags: [] }],
      ),
    [mutate],
  );

  const addTag = useCallback(
    (repoId: string, tag: string) => {
      const normalized = normalizeTag(tag);
      if (!normalized) return;
      mutate((prev) =>
        prev.map((r) =>
          r.id === repoId && !r.tags.includes(normalized)
            ? { ...r, tags: [...r.tags, normalized] }
            : r,
        ),
      );
    },
    [mutate],
  );

  const removeTag = useCallback(
    (repoId: string, tag: string) =>
      mutate((prev) =>
        prev.map((r) =>
          r.id === repoId ? { ...r, tags: r.tags.filter((t) => t !== tag) } : r,
        ),
      ),
    [mutate],
  );

  const value = useMemo<SavedReposContextValue>(() => {
    const sorted = [...saved].sort((a, b) => b.savedAt.localeCompare(a.savedAt));
    return {
      saved: sorted,
      savedIds: sorted.map((r) => r.id),
      allTags: Array.from(new Set(saved.flatMap((r) => r.tags))).sort(),
      isReady,
      isSaved: (id) => saved.some((r) => r.id === id),
      toggleSave,
      addTag,
      removeTag,
    };
  }, [saved, isReady, toggleSave, addTag, removeTag]);

  return (
    <SavedReposContext.Provider value={value}>
      {children}
    </SavedReposContext.Provider>
  );
};
