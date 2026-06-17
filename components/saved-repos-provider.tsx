"use client";

import { useSession } from "next-auth/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  addRepoTag,
  createFolder as createFolderAction,
  deleteFolder as deleteFolderAction,
  getSavedState,
  removeRepoTag,
  renameFolder as renameFolderAction,
  type SavedState,
  setRepoFolder as setRepoFolderAction,
  toggleSaveRepo,
} from "@/app/actions/saved-repos";
import type { SavedRepo } from "@/lib/types";
import { normalizeTag } from "@/lib/utils/tags";

// Saved repos now persist in Postgres via Server Actions, but the context keeps
// the exact same public API it had over localStorage — so every consumer (cards,
// detail page, collection) is unchanged. Mutations apply an optimistic update
// for instant feedback, then reconcile to the authoritative state the action
// returns. Calls are chained so the server sees them in order and the final
// snapshot reflects every write.

type SavedReposContextValue = {
  saved: SavedRepo[]; // sorted most recently saved first
  savedIds: string[];
  allTags: string[]; // distinct tags across the collection, sorted
  folders: string[]; // user-created folder names, in creation order
  isReady: boolean; // false until the first server load resolves
  isSaved: (id: string) => boolean;
  toggleSave: (repo: { id: string; nameWithOwner: string }) => void;
  addTag: (repoId: string, tag: string) => void;
  removeTag: (repoId: string, tag: string) => void;
  createFolder: (name: string) => void;
  renameFolder: (from: string, to: string) => void;
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
  const { status } = useSession();

  const [saved, setSaved] = useState<SavedRepo[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  const applyState = useCallback((state: SavedState) => {
    setSaved(state.saved);
    setFolders(state.folders);
  }, []);

  // Initial load once authenticated
  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    getSavedState()
      .then((state) => {
        if (active) applyState(state);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setIsReady(true);
      });
    return () => {
      active = false;
    };
  }, [status, applyState]);

  // Serialize server actions so writes land in order; only the latest op's
  // returned snapshot is applied (guards against out-of-order resolution).
  const chain = useRef<Promise<unknown>>(Promise.resolve());
  const opSeq = useRef(0);

  const runMutation = useCallback(
    (
      optimistic: () => void,
      action: () => Promise<SavedState>,
    ) => {
      optimistic();
      const seq = ++opSeq.current;
      chain.current = chain.current.then(
        () =>
          action().then((state) => {
            if (seq === opSeq.current) applyState(state);
          }),
        // On failure, drop optimistic state and re-sync from the server
        () => getSavedState().then(applyState).catch(() => {}),
      );
    },
    [applyState],
  );

  const toggleSave = useCallback(
    (repo: { id: string; nameWithOwner: string }) =>
      runMutation(
        () =>
          setSaved((prev) =>
            prev.some((r) => r.id === repo.id)
              ? prev.filter((r) => r.id !== repo.id)
              : [
                  { ...repo, savedAt: new Date().toISOString(), tags: [], folder: null },
                  ...prev,
                ],
          ),
        () => toggleSaveRepo({ githubId: repo.id, nameWithOwner: repo.nameWithOwner }),
      ),
    [runMutation],
  );

  const addTag = useCallback(
    (repoId: string, rawTag: string) => {
      const tag = normalizeTag(rawTag);
      if (!tag) return;
      runMutation(
        () =>
          setSaved((prev) =>
            prev.map((r) =>
              r.id === repoId && !r.tags.includes(tag)
                ? { ...r, tags: [...r.tags, tag] }
                : r,
            ),
          ),
        () => addRepoTag({ githubId: repoId, tag }),
      );
    },
    [runMutation],
  );

  const removeTag = useCallback(
    (repoId: string, rawTag: string) => {
      const tag = normalizeTag(rawTag);
      runMutation(
        () =>
          setSaved((prev) =>
            prev.map((r) =>
              r.id === repoId ? { ...r, tags: r.tags.filter((t) => t !== tag) } : r,
            ),
          ),
        () => removeRepoTag({ githubId: repoId, tag }),
      );
    },
    [runMutation],
  );

  const createFolder = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      runMutation(
        () =>
          setFolders((prev) =>
            prev.some((f) => f.toLowerCase() === trimmed.toLowerCase())
              ? prev
              : [...prev, trimmed],
          ),
        () => createFolderAction({ name: trimmed }),
      );
    },
    [runMutation],
  );

  const renameFolder = useCallback(
    (from: string, to: string) => {
      const trimmed = to.trim();
      if (!trimmed || trimmed === from) return;
      runMutation(() => {
        setFolders((prev) => prev.map((f) => (f === from ? trimmed : f)));
        setSaved((prev) =>
          prev.map((r) => (r.folder === from ? { ...r, folder: trimmed } : r)),
        );
      }, () => renameFolderAction({ from, to: trimmed }));
    },
    [runMutation],
  );

  const deleteFolder = useCallback(
    (name: string) =>
      runMutation(() => {
        setFolders((prev) => prev.filter((f) => f !== name));
        setSaved((prev) =>
          prev.map((r) => (r.folder === name ? { ...r, folder: null } : r)),
        );
      }, () => deleteFolderAction({ name })),
    [runMutation],
  );

  const setRepoFolder = useCallback(
    (repoId: string, folder: string | null) =>
      runMutation(
        () =>
          setSaved((prev) =>
            prev.map((r) => (r.id === repoId ? { ...r, folder } : r)),
          ),
        () => setRepoFolderAction({ githubId: repoId, folder }),
      ),
    [runMutation],
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
      renameFolder,
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
    renameFolder,
    deleteFolder,
    setRepoFolder,
  ]);

  return (
    <SavedReposContext.Provider value={value}>
      {children}
    </SavedReposContext.Provider>
  );
};
