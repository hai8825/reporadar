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
//
// Two storage keys per user: the saved repos themselves, and the list of
// folder names (kept separately so empty folders can exist).

const savedKey = (userId: string) => `reporadar:saved:${userId}`;
const foldersKey = (userId: string) => `reporadar:folders:${userId}`;

const readSaved = (userId: string): SavedRepo[] => {
  try {
    const raw = window.localStorage.getItem(savedKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<Partial<SavedRepo>>;
    // Migrate entries from before tags/folders existed
    return parsed
      .filter((r): r is SavedRepo & Partial<SavedRepo> =>
        Boolean(r.id && r.nameWithOwner && r.savedAt),
      )
      .map((r) => ({ ...r, tags: r.tags ?? [], folder: r.folder ?? null }));
  } catch {
    // Corrupt JSON or storage disabled — treat as empty rather than crash
    return [];
  }
};

const readFolders = (userId: string): string[] => {
  try {
    const raw = window.localStorage.getItem(foldersKey(userId));
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((f) => typeof f === "string") : [];
  } catch {
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
  folders: string[]; // user-created folder names, in creation order
  isReady: boolean; // false until localStorage has been read on the client
  isSaved: (id: string) => boolean;
  toggleSave: (repo: { id: string; nameWithOwner: string }) => void;
  addTag: (repoId: string, tag: string) => void;
  removeTag: (repoId: string, tag: string) => void;
  createFolder: (name: string) => void;
  deleteFolder: (name: string) => void;
  setRepoFolder: (repoId: string, folder: string | null) => void;
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
  const [folders, setFolders] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Hydrate once the session (and thus the storage keys) is known
  useEffect(() => {
    if (!userId) return;
    setSaved(readSaved(userId));
    setFolders(readFolders(userId));
    setIsReady(true);
  }, [userId]);

  // Single write path per key: every mutation persists synchronously
  const mutateSaved = useCallback(
    (update: (prev: SavedRepo[]) => SavedRepo[]) => {
      if (!userId) return;
      setSaved((prev) => {
        const next = update(prev);
        window.localStorage.setItem(savedKey(userId), JSON.stringify(next));
        return next;
      });
    },
    [userId],
  );

  const mutateFolders = useCallback(
    (update: (prev: string[]) => string[]) => {
      if (!userId) return;
      setFolders((prev) => {
        const next = update(prev);
        window.localStorage.setItem(foldersKey(userId), JSON.stringify(next));
        return next;
      });
    },
    [userId],
  );

  const toggleSave = useCallback(
    (repo: { id: string; nameWithOwner: string }) =>
      mutateSaved((prev) =>
        prev.some((r) => r.id === repo.id)
          ? prev.filter((r) => r.id !== repo.id)
          : [
              ...prev,
              {
                ...repo,
                savedAt: new Date().toISOString(),
                tags: [],
                folder: null,
              },
            ],
      ),
    [mutateSaved],
  );

  const addTag = useCallback(
    (repoId: string, tag: string) => {
      const normalized = normalizeTag(tag);
      if (!normalized) return;
      mutateSaved((prev) =>
        prev.map((r) =>
          r.id === repoId && !r.tags.includes(normalized)
            ? { ...r, tags: [...r.tags, normalized] }
            : r,
        ),
      );
    },
    [mutateSaved],
  );

  const removeTag = useCallback(
    (repoId: string, tag: string) =>
      mutateSaved((prev) =>
        prev.map((r) =>
          r.id === repoId ? { ...r, tags: r.tags.filter((t) => t !== tag) } : r,
        ),
      ),
    [mutateSaved],
  );

  const createFolder = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      mutateFolders((prev) =>
        prev.some((f) => f.toLowerCase() === trimmed.toLowerCase())
          ? prev
          : [...prev, trimmed],
      );
    },
    [mutateFolders],
  );

  // Deleting a folder unfiles its repos — it never unsaves them
  const deleteFolder = useCallback(
    (name: string) => {
      mutateFolders((prev) => prev.filter((f) => f !== name));
      mutateSaved((prev) =>
        prev.map((r) => (r.folder === name ? { ...r, folder: null } : r)),
      );
    },
    [mutateFolders, mutateSaved],
  );

  const setRepoFolder = useCallback(
    (repoId: string, folder: string | null) =>
      mutateSaved((prev) =>
        prev.map((r) => (r.id === repoId ? { ...r, folder } : r)),
      ),
    [mutateSaved],
  );

  const value = useMemo<SavedReposContextValue>(() => {
    const sorted = [...saved].sort((a, b) => b.savedAt.localeCompare(a.savedAt));
    return {
      saved: sorted,
      savedIds: sorted.map((r) => r.id),
      allTags: Array.from(new Set(saved.flatMap((r) => r.tags))).sort(),
      folders,
      isReady,
      isSaved: (id) => saved.some((r) => r.id === id),
      toggleSave,
      addTag,
      removeTag,
      createFolder,
      deleteFolder,
      setRepoFolder,
    };
  }, [
    saved,
    folders,
    isReady,
    toggleSave,
    addTag,
    removeTag,
    createFolder,
    deleteFolder,
    setRepoFolder,
  ]);

  return (
    <SavedReposContext.Provider value={value}>
      {children}
    </SavedReposContext.Provider>
  );
};
