import type { Config } from "tailwindcss";

// Colors are defined as CSS-variable RGB channels (e.g. "123 92 240") in
// globals.css, one block per [data-theme]. Using the `rgb(var(--x) / <alpha-value>)`
// form keeps Tailwind's slash-opacity working (e.g. `border-accent-violet/40`).
//
// The token names below are SEMANTIC, not literal — `accent-violet` is "the
// theme accent" (violet in Deep space, teal in Inked, orange in Calcite…),
// and `accent-amber` is "the star/metric color". They keep their original
// names so no component markup had to change when theming was added.
const withAlpha = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: withAlpha("--bg-primary"),
          secondary: withAlpha("--bg-secondary"),
          tertiary: withAlpha("--bg-tertiary"),
          band: withAlpha("--card-band"), // card header/footer band
        },
        accent: {
          violet: withAlpha("--accent"), // theme accent
          chip: withAlpha("--accent-chip"), // text on muted/selected chips (brighter where needed)
          "violet-muted": "rgb(var(--accent) / 0.13)", // chip/badge fills
          "violet-border": "rgb(var(--accent) / 0.33)", // accented borders
          fg: withAlpha("--accent-fg"), // text/icon on a solid accent fill
          amber: withAlpha("--star"), // star/metric color
        },
        text: {
          primary: withAlpha("--text-primary"),
          secondary: withAlpha("--text-secondary"),
          muted: withAlpha("--text-muted"),
        },
        // Activity ramp — semantically fixed (green→red), but tuned per theme
        // for contrast (brighter on dark, deeper on light)
        activity: {
          active: withAlpha("--activity-active"),
          maintained: withAlpha("--activity-maintained"),
          slow: withAlpha("--activity-slow"),
          inactive: withAlpha("--activity-inactive"),
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      // Theme-aware card elevation (stronger on dark, softer on light) — see
      // --card-shadow in globals.css. Used by borderless card surfaces.
      boxShadow: {
        card: "var(--card-shadow)",
        "card-hover": "var(--card-shadow-hover)",
      },
    },
  },
  plugins: [],
};
export default config;
