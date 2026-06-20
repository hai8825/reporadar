// Theme registry. Each id maps to a [data-theme="<id>"] block in globals.css.
// `mode` drives `color-scheme` (native controls/scrollbars) and is shown in the
// switcher. Keep DEFAULT_THEME in sync with the :root block in globals.css and
// the inline no-flash script in layout.tsx.

export type ThemeMode = "dark" | "light";

export type ThemeOption = {
  id: string;
  label: string;
  mode: ThemeMode;
  // Hex equivalents of the theme's --bg-primary / --accent, for the switcher's
  // preview swatch (CSS vars only reflect the *active* theme, so we can't read
  // each option's colors live).
  swatch: { bg: string; accent: string };
};

export const THEMES: ThemeOption[] = [
  { id: "deep-space", label: "Deep space", mode: "dark", swatch: { bg: "#0D1117", accent: "#7B5CF0" } },
  { id: "inked", label: "Inked", mode: "dark", swatch: { bg: "#0E1213", accent: "#2DD4BF" } },
  { id: "frosted-aura", label: "Frosted aura", mode: "light", swatch: { bg: "#EAECEF", accent: "#586273" } },
  { id: "calcite", label: "Calcite", mode: "light", swatch: { bg: "#EFE9E1", accent: "#C2410C" } },
];

export const DEFAULT_THEME = "deep-space";

export const THEME_STORAGE_KEY = "reporadar:theme";

export const isValidTheme = (value: string | null): value is string =>
  THEMES.some((t) => t.id === value);
