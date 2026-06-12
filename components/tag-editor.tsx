"use client";

import { useState } from "react";
import { useSavedRepos } from "@/hooks/useSavedRepos";
import { CloseIcon } from "./icons";

type TagEditorProps = {
  repoId: string;
  tags: string[];
};

// Removable tag pills + inline add input, shown on saved repo cards
export const TagEditor = ({ repoId, tags }: TagEditorProps) => {
  const { addTag, removeTag } = useSavedRepos();
  const [draft, setDraft] = useState("");

  const submit = () => {
    addTag(repoId, draft);
    setDraft("");
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-t border-background-tertiary pt-3">
      {tags.map((tag) => (
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
            submit();
          }
        }}
        placeholder="+ tag"
        aria-label="Add tag to this repo"
        className="w-20 rounded-full border border-background-tertiary bg-background-primary px-2 py-0.5 text-xs text-text-primary placeholder:text-text-muted focus:border-accent-violet"
      />
    </div>
  );
};
