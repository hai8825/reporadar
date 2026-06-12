"use client";

import { useState } from "react";
import { useSavedRepos } from "@/hooks/useSavedRepos";
import { CloseIcon } from "./icons";

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
      <select
        value={entry.folder ?? ""}
        onChange={(e) => setRepoFolder(repoId, e.target.value || null)}
        aria-label="Move to folder"
        className="max-w-[10rem] rounded-md border border-background-tertiary bg-background-primary px-2 py-0.5 text-xs text-text-secondary focus:border-accent-violet"
      >
        <option value="">No folder</option>
        {folders.map((folder) => (
          <option key={folder} value={folder}>
            {folder}
          </option>
        ))}
      </select>

      {entry.tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full border border-accent-violet-border bg-accent-violet-muted px-2 py-0.5 text-xs text-accent-violet"
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
