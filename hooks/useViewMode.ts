"use client";

import { useCallback, useEffect, useState } from "react";

export type ViewMode = "tile" | "list";

const STORAGE_KEY = "reporadar:view";

/** Tile/list preference, persisted per browser. Defaults to tile until hydrated. */
export const useViewMode = (): [ViewMode, (mode: ViewMode) => void] => {
  const [mode, setMode] = useState<ViewMode>("tile");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "list" || stored === "tile") setMode(stored);
  }, []);

  const update = useCallback((next: ViewMode) => {
    setMode(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  return [mode, update];
};
