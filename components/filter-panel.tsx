"use client";

import { useState } from "react";
import type { PushedPreset, SearchFilters, StarPreset } from "@/lib/types";
import { STAR_PRESETS } from "@/lib/types";
import { CloseIcon } from "./icons";

// Curated language list — GitHub has hundreds; these cover the common cases
const LANGUAGE_OPTIONS = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Go",
  "Rust",
  "Java",
  "C",
  "C++",
  "C#",
  "Ruby",
  "PHP",
  "Swift",
  "Kotlin",
  "Elixir",
] as const;

// Label → SPDX id used in the license: search qualifier
const LICENSE_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "MIT", value: "mit" },
  { label: "Apache-2.0", value: "apache-2.0" },
  { label: "GPL-3.0", value: "gpl-3.0" },
  { label: "BSD", value: "bsd-3-clause" },
];

const PUSHED_OPTIONS: Array<{ label: string; value: PushedPreset }> = [
  { label: "This week", value: "week" },
  { label: "This month", value: "month" },
  { label: "This year", value: "year" },
];

const starLabel = (preset: StarPreset): string =>
  preset >= 1000 ? `${preset / 1000}k+` : `${preset}+`;

type ChipProps = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

// Pill-shaped filter chip per the design rules
const Chip = ({ active, onClick, children }: ChipProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
      active
        ? "border-accent-violet bg-accent-violet-muted text-accent-chip"
        : "border-background-tertiary text-text-secondary hover:border-text-muted"
    }`}
  >
    {children}
  </button>
);

type FilterPanelProps = {
  filters: SearchFilters;
  onChange: (next: SearchFilters) => void;
};

export const FilterPanel = ({ filters, onChange }: FilterPanelProps) => {
  const [topicDraft, setTopicDraft] = useState("");

  const set = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) =>
    onChange({ ...filters, [key]: value });

  const toggleLanguage = (lang: string) =>
    set(
      "languages",
      filters.languages.includes(lang)
        ? filters.languages.filter((l) => l !== lang)
        : [...filters.languages, lang],
    );

  const addTopic = () => {
    const topic = topicDraft.trim().toLowerCase().replace(/\s+/g, "-");
    if (topic && !filters.topics.includes(topic)) {
      set("topics", [...filters.topics, topic]);
    }
    setTopicDraft("");
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg bg-background-secondary p-4 shadow-card">
      <FilterRow label="Language">
        {LANGUAGE_OPTIONS.map((lang) => (
          <Chip key={lang} active={filters.languages.includes(lang)} onClick={() => toggleLanguage(lang)}>
            {lang}
          </Chip>
        ))}
      </FilterRow>

      <FilterRow label="Minimum stars">
        <Chip active={filters.minStars === null} onClick={() => set("minStars", null)}>
          Any
        </Chip>
        {STAR_PRESETS.map((preset) => (
          <Chip
            key={preset}
            active={filters.minStars === preset}
            onClick={() => set("minStars", filters.minStars === preset ? null : preset)}
          >
            {starLabel(preset)}
          </Chip>
        ))}
      </FilterRow>

      <FilterRow label="Last pushed">
        <Chip active={filters.pushed === null} onClick={() => set("pushed", null)}>
          Any
        </Chip>
        {PUSHED_OPTIONS.map(({ label, value }) => (
          <Chip
            key={value}
            active={filters.pushed === value}
            onClick={() => set("pushed", filters.pushed === value ? null : value)}
          >
            {label}
          </Chip>
        ))}
      </FilterRow>

      <FilterRow label="License">
        <Chip active={filters.license === null} onClick={() => set("license", null)}>
          Any
        </Chip>
        {LICENSE_OPTIONS.map(({ label, value }) => (
          <Chip
            key={value}
            active={filters.license === value}
            onClick={() => set("license", filters.license === value ? null : value)}
          >
            {label}
          </Chip>
        ))}
      </FilterRow>

      <FilterRow label="Beginner friendly">
        <Chip
          active={filters.beginnerFriendly}
          onClick={() => set("beginnerFriendly", !filters.beginnerFriendly)}
        >
          Has “good first issue”s
        </Chip>
      </FilterRow>

      <FilterRow label="Topics">
        {filters.topics.map((topic) => (
          <span
            key={topic}
            className="inline-flex items-center gap-1.5 rounded-full border border-accent-violet bg-accent-violet-muted px-3 py-1 text-xs text-accent-chip"
          >
            {topic}
            <button
              type="button"
              aria-label={`Remove topic ${topic}`}
              onClick={() => set("topics", filters.topics.filter((t) => t !== topic))}
              className="hover:text-text-primary"
            >
              <CloseIcon className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={topicDraft}
          onChange={(e) => setTopicDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTopic();
            }
          }}
          placeholder="Add topic + Enter"
          aria-label="Add topic filter"
          className="w-36 rounded-full border border-background-tertiary bg-background-primary px-3 py-1 text-xs text-text-primary placeholder:text-text-muted"
        />
      </FilterRow>
    </div>
  );
};

const FilterRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-wrap items-center gap-2">
    <span className="w-28 shrink-0 text-xs font-medium uppercase tracking-wide text-text-muted">
      {label}
    </span>
    {children}
  </div>
);
