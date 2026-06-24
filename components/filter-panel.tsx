"use client";

import { useState } from "react";
import type { PushedPreset, SearchFilters, StarPreset } from "@/lib/types";
import { STAR_PRESETS } from "@/lib/types";
import {
  ClockIcon,
  CloseIcon,
  CodeIcon,
  LicenseIcon,
  SparkleIcon,
  StarIcon,
  TagIcon,
} from "./icons";

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

type FilterOptionProps = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

// Flat text option (no pill). Selected state is marked by an ember accent bar
// underneath — the same active-marker the nav links use.
const FilterOption = ({ active, onClick, children }: FilterOptionProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`relative pb-1 text-sm transition-colors ${
      active
        ? "font-medium text-text-primary"
        : "text-text-secondary hover:text-text-primary"
    }`}
  >
    {children}
    {active && (
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-accent-violet"
      />
    )}
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
    <div className="grid grid-cols-[9rem_1fr] overflow-hidden rounded-lg bg-background-secondary shadow-card">
      <FilterRow label="Language" icon={<CodeIcon className="h-3.5 w-3.5 text-text-muted" />}>
        {LANGUAGE_OPTIONS.map((lang) => (
          <FilterOption key={lang} active={filters.languages.includes(lang)} onClick={() => toggleLanguage(lang)}>
            {lang}
          </FilterOption>
        ))}
      </FilterRow>

      <FilterRow
        label="Minimum stars"
        icon={<StarIcon className="h-3.5 w-3.5 text-text-muted" />}
      >
        <FilterOption active={filters.minStars === null} onClick={() => set("minStars", null)}>
          Any
        </FilterOption>
        {STAR_PRESETS.map((preset) => (
          <FilterOption
            key={preset}
            active={filters.minStars === preset}
            onClick={() => set("minStars", filters.minStars === preset ? null : preset)}
          >
            {starLabel(preset)}
          </FilterOption>
        ))}
      </FilterRow>

      <FilterRow label="Last pushed" icon={<ClockIcon className="h-3.5 w-3.5 text-text-muted" />}>
        <FilterOption active={filters.pushed === null} onClick={() => set("pushed", null)}>
          Any
        </FilterOption>
        {PUSHED_OPTIONS.map(({ label, value }) => (
          <FilterOption
            key={value}
            active={filters.pushed === value}
            onClick={() => set("pushed", filters.pushed === value ? null : value)}
          >
            {label}
          </FilterOption>
        ))}
      </FilterRow>

      <FilterRow label="License" icon={<LicenseIcon className="h-3.5 w-3.5 text-text-muted" />}>
        <FilterOption active={filters.license === null} onClick={() => set("license", null)}>
          Any
        </FilterOption>
        {LICENSE_OPTIONS.map(({ label, value }) => (
          <FilterOption
            key={value}
            active={filters.license === value}
            onClick={() => set("license", filters.license === value ? null : value)}
          >
            {label}
          </FilterOption>
        ))}
      </FilterRow>

      <FilterRow
        label="Beginner friendly"
        icon={<SparkleIcon className="h-3.5 w-3.5 text-text-muted" />}
      >
        <FilterOption
          active={filters.beginnerFriendly}
          onClick={() => set("beginnerFriendly", !filters.beginnerFriendly)}
        >
          Has “good first issue”s
        </FilterOption>
      </FilterRow>

      <FilterRow label="Topics" icon={<TagIcon className="h-3.5 w-3.5 text-text-muted" />}>
        {filters.topics.map((topic) => (
          <span
            key={topic}
            className="inline-flex items-center gap-1.5 rounded-full border border-background-tertiary px-3 py-1 text-xs text-text-secondary"
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

// display:contents drops these two cells straight into the parent grid, so the
// label cells line up into one continuous band down the left column.
const FilterRow = ({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="contents">
    <div className="flex items-center gap-2 bg-background-band px-4 py-3 text-xs font-medium uppercase leading-tight tracking-wide text-text-primary">
      <span className="shrink-0">{icon}</span>
      {label}
    </div>
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">{children}</div>
  </div>
);
