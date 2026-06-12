// Activity level is computed from pushedAt + isArchived — there is no direct API field.

export type ActivityLevel = "active" | "maintained" | "slow" | "inactive";

export type ActivityInfo = {
  level: ActivityLevel;
  label: string;
  color: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

const ACTIVITY_META: Record<ActivityLevel, ActivityInfo> = {
  active: { level: "active", label: "Active", color: "#22C55E" },
  maintained: { level: "maintained", label: "Maintained", color: "#EAB308" },
  slow: { level: "slow", label: "Slow", color: "#F97316" },
  inactive: { level: "inactive", label: "Inactive", color: "#EF4444" },
};

// Higher rank = healthier repo; used to pick the "winner" on /compare
export const ACTIVITY_RANK: Record<ActivityLevel, number> = {
  active: 3,
  maintained: 2,
  slow: 1,
  inactive: 0,
};

/**
 * Pure: pass `now` in tests to pin the clock.
 * Archived repos are always "inactive" regardless of push date.
 */
export const getActivityLevel = (
  pushedAt: string | null,
  isArchived: boolean,
  now: Date = new Date(),
): ActivityInfo => {
  if (isArchived || !pushedAt) return ACTIVITY_META.inactive;

  const ageDays = (now.getTime() - new Date(pushedAt).getTime()) / DAY_MS;
  if (ageDays < 30) return ACTIVITY_META.active;
  if (ageDays <= 180) return ACTIVITY_META.maintained;
  if (ageDays <= 365) return ACTIVITY_META.slow;
  return ACTIVITY_META.inactive;
};
