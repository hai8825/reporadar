"use client";

import { useState } from "react";
import { useSavedRepos } from "@/hooks/useSavedRepos";
import { ChevronDownIcon, CloseIcon } from "./icons";

type SavedRepoToolsProps = {
  repoId: string;
};

// Footer row on saved repo cards: folder picker + removable tag pills +
// inline add-tag input. Reads everything from the shared context, so all
// changes propagate instantly with no refetch.
export const SavedRepoTools = ({ repoId }: SavedRepoToolsProps) => {
  const { saved, folders, addTag, removeTag, setRepoFolder } = useSavedRepos();
  const [draft, setDraft] = useState("");

  const entry = saved.find((r) => r.id === repoId);
  if (!entry) return null;

  const submitTag = () => {
    addTag(repoId, draft);
    setDraft("");
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-t border-background-tertiary pt-3">
      {/* Native select with the OS arrow replaced by our own chevron —
          appearance-none, then position the icon over the right padding */}
      <span className="relative inline-flex">
        <select
          value={entry.folder ?? ""}
          onChange={(e) => setRepoFolder(repoId, e.target.value || null)}
          aria-label="Move to folder"
          className={`max-w-[10rem] cursor-pointer appearance-none truncate rounded-full border bg-transparent py-0.5 pl-2.5 pr-7 text-xs transition-colors hover:border-text-muted focus:border-accent-violet ${
            entry.folder
              ? "border-accent-violet-border text-text-secondary"
              : "border-background-tertiary text-text-muted"
          }`}
        >
          {/* the popup list itself is OS-rendered; give options dark colors
              where browsers honor them (Chrome/Edge do) */}
          <option value="" className="bg-background-primary text-text-primary">
            No folder
          </option>
          {folders.map((folder) => (
            <option
              key={folder}
              value={folder}
              className="bg-background-primary text-text-primary"
            >
              {folder}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-text-muted" />
      </span>

      {entry.tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full border border-accent-violet-border bg-accent-violet-muted px-2 py-0.5 text-xs text-accent-chip"
        >
          {tag}
          <button
            type="button"
            aria-label={`Remove tag ${tag}`}
            onClick={() => removeTag(repoId, tag)}
            className="hover:text-text-primary"
          >
            <CloseIcon className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}

      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submitTag();
          }
        }}
        placeholder="+ tag"
        aria-label="Add tag to this repo"
        className="w-20 rounded-full border border-background-tertiary bg-background-primary px-2 py-0.5 text-xs text-text-primary placeholder:text-text-muted focus:border-accent-violet"
      />
    </div>
  );
};
