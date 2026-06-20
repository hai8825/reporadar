"use client";

import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { THEMES } from "@/lib/themes";
import { ChevronDownIcon } from "./icons";

// Theme picker for the nav. No modal (design rule) — a button + in-place menu,
// with a transparent backdrop to capture outside clicks.
export const ThemeSwitcher = () => {
  const [theme, setTheme] = useTheme();
  const [open, setOpen] = useState(false);

  const active = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  // Small two-tone swatch (bg + accent dot) for an option
  const Swatch = ({ bg, accent }: { bg: string; accent: string }) => (
    <span
      aria-hidden
      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-accent-violet-border"
      style={{ backgroundColor: bg }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
    </span>
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Theme: ${active.label}`}
        className="flex items-center gap-2 rounded-md border border-accent-violet-border bg-background-secondary px-2.5 py-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
      >
        <Swatch bg={active.swatch.bg} accent={active.swatch.accent} />
        <span className="hidden sm:inline">{active.label}</span>
        <ChevronDownIcon className="h-3 w-3" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <ul
            role="listbox"
            className="absolute right-0 z-50 mt-1 w-44 overflow-hidden rounded-lg border-[0.5px] border-accent-violet-border bg-background-secondary py-1 shadow-lg shadow-black/20"
          >
            {THEMES.map((t) => {
              const isActive = t.id === theme;
              return (
                <li key={t.id} role="option" aria-selected={isActive}>
                  <button
                    type="button"
                    onClick={() => {
                      setTheme(t.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-sm transition-colors hover:bg-background-tertiary ${
                      isActive ? "text-accent-violet" : "text-text-secondary"
                    }`}
                  >
                    <Swatch bg={t.swatch.bg} accent={t.swatch.accent} />
                    <span className="flex-1">{t.label}</span>
                    <span className="text-xs text-text-muted">{t.mode}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};
