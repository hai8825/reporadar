"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_THEME, isValidTheme, THEME_STORAGE_KEY } from "@/lib/themes";

// Theme is a per-device UI preference (like view mode), so it lives in
// localStorage — applied pre-hydration by the inline script in layout.tsx to
// avoid a flash. This hook just reflects + updates the current value.
export const useTheme = (): [string, (id: string) => void] => {
  // Initialize from the attribute the inline script already set (falls back to
  // default during SSR / before the script runs)
  const [theme, setThemeState] = useState(DEFAULT_THEME);

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    if (isValidTheme(current ?? null)) setThemeState(current as string);
  }, []);

  const setTheme = useCallback((id: string) => {
    if (!isValidTheme(id)) return;
    document.documentElement.dataset.theme = id;
    window.localStorage.setItem(THEME_STORAGE_KEY, id);
    setThemeState(id);
  }, []);

  return [theme, setTheme];
};
