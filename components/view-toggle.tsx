"use client";

import type { ViewMode } from "@/hooks/useViewMode";

type ViewToggleProps = {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
};

const TileIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden>
    <path d="M1.5 1.5h5.5v5.5H1.5zM9 1.5h5.5v5.5H9zM1.5 9h5.5v5.5H1.5zM9 9h5.5v5.5H9z" />
  </svg>
);

const ListIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden>
    <path d="M1.5 2h13v2.5h-13zM1.5 6.75h13v2.5h-13zM1.5 11.5h13V14h-13z" />
  </svg>
);

export const ViewToggle = ({ mode, onChange }: ViewToggleProps) => (
  <div
    role="group"
    aria-label="View mode"
    className="flex rounded-md border border-background-tertiary"
  >
    {(
      [
        { value: "tile", label: "Tile view", Icon: TileIcon },
        { value: "list", label: "List view", Icon: ListIcon },
      ] as const
    ).map(({ value, label, Icon }) => (
      <button
        key={value}
        type="button"
        aria-label={label}
        aria-pressed={mode === value}
        title={label}
        onClick={() => onChange(value)}
        className={`px-2.5 py-1.5 first:rounded-l-md last:rounded-r-md ${
          mode === value
            ? "bg-background-secondary text-accent-violet"
            : "text-text-muted hover:text-text-primary"
        }`}
      >
        <Icon className="h-3.5 w-3.5" />
      </button>
    ))}
  </div>
);
