import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: "#0D1117", // page bg, nav
          secondary: "#161B25", // card surfaces
          tertiary: "#1E2637", // hover states, alternating rows
        },
        accent: {
          violet: "#7B5CF0", // buttons, active states, focus rings
          "violet-muted": "#7B5CF020", // chip/badge fills
          "violet-border": "#7B5CF050", // accented borders
          amber: "#F59E0B", // star counts only
        },
        text: {
          primary: "#E8E6F0",
          secondary: "#9CA3AF",
          muted: "#6B7280",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [],
};
export default config;
