"use client";

import { useEffect, useRef, useState } from "react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
  // The URL is the source of truth, but router.replace echoes `value` back
  // asynchronously — controlling the input by it directly resets the cursor
  // mid-typing. So the input is driven by a local draft, and we only accept
  // external `value` changes we didn't push ourselves (e.g. back/forward).
  const [draft, setDraft] = useState(value);
  const lastPushed = useRef(value);

  useEffect(() => {
    if (value !== lastPushed.current) {
      setDraft(value);
      lastPushed.current = value;
    }
  }, [value]);

  const handleChange = (next: string) => {
    setDraft(next);
    lastPushed.current = next;
    onChange(next);
  };

  return (
    <div className="relative">
      <svg
        viewBox="0 0 16 16"
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden
      >
        <circle cx="7" cy="7" r="4.75" />
        <path d="m10.5 10.5 3 3" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={draft}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search repos by name, description, or topic…"
        aria-label="Search repositories"
        className="w-full rounded-lg border-[0.5px] border-accent-violet-border bg-background-secondary py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-violet"
      />
    </div>
  );
};
