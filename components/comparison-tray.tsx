"use client";

import Link from "next/link";
import { useComparison } from "@/hooks/useComparison";
import { CloseIcon, CompareIcon } from "./icons";

// Fixed tray at the bottom while 1–2 repos are staged; hidden when empty
export const ComparisonTray = () => {
  const { staged, toggleStaged, clearStaged } = useComparison();

  if (staged.length === 0) return null;

  const compareHref =
    staged.length === 2
      ? `/compare?a=${encodeURIComponent(staged[0].nameWithOwner)}&b=${encodeURIComponent(staged[1].nameWithOwner)}`
      : null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-accent-violet-border bg-background-secondary/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <span className="inline-flex items-center gap-2 text-sm text-text-secondary">
          <CompareIcon className="h-4 w-4 text-accent-violet" />
          Compare ({staged.length}/2)
        </span>

        {staged.map((item) => (
          <span
            key={item.id}
            className="inline-flex items-center gap-2 rounded-full border border-accent-violet-border bg-accent-violet-muted px-3 py-1 text-sm text-accent-chip"
          >
            {item.nameWithOwner}
            <button
              type="button"
              aria-label={`Remove ${item.nameWithOwner} from comparison`}
              onClick={() => toggleStaged(item)}
              className="hover:text-text-primary"
            >
              <CloseIcon className="h-3 w-3" />
            </button>
          </span>
        ))}

        {staged.length === 1 && (
          <span className="text-sm text-text-muted">Pick one more repo to compare</span>
        )}

        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            onClick={clearStaged}
            className="text-sm text-text-muted hover:text-text-primary"
          >
            Clear
          </button>
          {compareHref && (
            <Link
              href={compareHref}
              className="rounded-md bg-accent-violet px-4 py-1.5 text-sm font-medium text-accent-fg hover:bg-accent-violet/90"
            >
              Compare
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
