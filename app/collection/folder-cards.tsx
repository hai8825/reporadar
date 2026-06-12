"use client";

import { useState } from "react";
import { CloseIcon, PencilIcon } from "@/components/icons";
import { useSavedRepos } from "@/hooks/useSavedRepos";
import type { RepoCardData, SavedRepo } from "@/lib/types";

// Sentinel key for the built-in "everything" view. Real folder names are
// unlikely to collide, and createFolder trims input so it can't be typed.
export const FOLDER_ALL = "__all__";

type FolderStats = {
  count: number;
  languages: Array<{ name: string; color: string | null; count: number }>;
  tags: string[];
};

// Aggregate what a folder contains: repo count, top languages (from live
// fetched data), and the tags used inside
const computeStats = (
  entries: SavedRepo[],
  reposById: Map<string, RepoCardData>,
): FolderStats => {
  const langCounts = new Map<string, { color: string | null; count: number }>();
  for (const entry of entries) {
    const lang = reposById.get(entry.id)?.primaryLanguage;
    if (!lang) continue;
    const existing = langCounts.get(lang.name);
    langCounts.set(lang.name, {
      color: lang.color,
      count: (existing?.count ?? 0) + 1,
    });
  }

  return {
    count: entries.length,
    languages: Array.from(langCounts, ([name, { color, count }]) => ({ name, color, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3),
    tags: Array.from(new Set(entries.flatMap((e) => e.tags))).sort().slice(0, 4),
  };
};

type FolderCardsProps = {
  active: string;
  onSelect: (key: string) => void;
  reposById: Map<string, RepoCardData>;
};

export const FolderCards = ({ active, onSelect, reposById }: FolderCardsProps) => {
  const { saved, folders, createFolder, renameFolder, deleteFolder } =
    useSavedRepos();
  const [draft, setDraft] = useState("");
  // Folder currently being renamed inline + its draft name
  const [editing, setEditing] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  const submitFolder = () => {
    createFolder(draft);
    setDraft("");
  };

  const commitRename = (from: string) => {
    const next = editDraft.trim();
    // Mirror renameFolder's validity check so we only re-select on success
    const willRename =
      next !== "" &&
      next !== from &&
      !folders.some((f) => f !== from && f.toLowerCase() === next.toLowerCase());
    renameFolder(from, next);
    if (willRename && active === from) onSelect(next);
    setEditing(null);
  };

  const cards: Array<{ key: string; label: string; stats: FolderStats; deletable: boolean }> = [
    { key: FOLDER_ALL, label: "All", stats: computeStats(saved, reposById), deletable: false },
    ...folders.map((folder) => ({
      key: folder,
      label: folder,
      stats: computeStats(saved.filter((r) => r.folder === folder), reposById),
      deletable: true,
    })),
  ];

  return (
    <section
      aria-label="Collections"
      className="rounded-lg border-[0.5px] border-accent-violet-border bg-background-secondary p-4"
    >
      <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-text-muted">
        Collections
      </h2>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ key, label, stats, deletable }) => (
          <div
            key={key}
            className={`group/folder relative rounded-lg border transition-colors ${
              active === key
                ? "border-accent-violet bg-accent-violet-muted"
                : "border-background-tertiary bg-background-primary hover:border-text-muted"
            }`}
          >
            {editing === key ? (
              <div className="p-3">
                <input
                  autoFocus
                  type="text"
                  value={editDraft}
                  onChange={(e) => setEditDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitRename(key);
                    }
                    if (e.key === "Escape") setEditing(null);
                  }}
                  onBlur={() => setEditing(null)}
                  aria-label={`Rename folder ${label}`}
                  className="w-full rounded-md border border-accent-violet-border bg-background-primary px-2 py-1 font-display text-sm text-text-primary"
                />
                <p className="mt-1.5 text-[10px] text-text-muted">
                  Enter to rename · Esc to cancel
                </p>
              </div>
            ) : (
            <button
              type="button"
              onClick={() => onSelect(key)}
              aria-pressed={active === key}
              className="flex w-full flex-col gap-2 p-3 text-left"
            >
              <span
                className={`flex items-baseline justify-between gap-2 ${
                  deletable ? "pr-10" : ""
                }`}
              >
                <span
                  className={`truncate font-display text-sm font-medium ${
                    active === key ? "text-accent-violet" : "text-text-primary"
                  }`}
                >
                  {label}
                </span>
                <span className="font-mono text-xs text-text-muted">
                  {stats.count} {stats.count === 1 ? "repo" : "repos"}
                </span>
              </span>

              {stats.languages.length > 0 && (
                <span className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-secondary">
                  {stats.languages.map(({ name, color }) => (
                    <span key={name} className="inline-flex items-center gap-1">
                      <span
                        aria-hidden
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: color ?? "#6B7280" }}
                      />
                      {name}
                    </span>
                  ))}
                </span>
              )}

              {stats.tags.length > 0 && (
                <span className="flex flex-wrap gap-1">
                  {stats.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-accent-violet-border px-1.5 py-px text-[10px] text-text-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </span>
              )}
            </button>
            )}

            {deletable && editing !== key && (
              <div className="absolute right-2 top-2.5 flex gap-0.5">
                <button
                  type="button"
                  aria-label={`Rename folder ${label}`}
                  title="Rename folder"
                  onClick={() => {
                    setEditing(key);
                    setEditDraft(label);
                  }}
                  className="rounded p-0.5 text-text-muted opacity-0 hover:text-text-primary focus-visible:opacity-100 group-hover/folder:opacity-100"
                >
                  <PencilIcon className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  aria-label={`Delete folder ${label} (repos stay saved)`}
                  title="Delete folder — repos stay saved"
                  onClick={() => {
                    if (active === key) onSelect(FOLDER_ALL);
                    deleteFolder(key);
                  }}
                  className="rounded p-0.5 text-text-muted opacity-0 hover:text-text-primary focus-visible:opacity-100 group-hover/folder:opacity-100"
                >
                  <CloseIcon className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Inline folder creation — no modal, per design rules */}
        <div className="flex items-center rounded-lg border border-dashed border-background-tertiary p-3">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submitFolder();
              }
            }}
            placeholder="New folder + Enter"
            aria-label="Create new folder"
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        </div>
      </div>
    </section>
  );
};
