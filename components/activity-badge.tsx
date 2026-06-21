import { type ActivityLevel, getActivityLevel } from "@/lib/utils/activity";
import { formatDate } from "@/lib/utils/format";

type ActivityBadgeProps = {
  pushedAt: string | null;
  isArchived: boolean;
};

// Theme-aware colors — the activity ramp is defined per theme in globals.css.
// Rendered as a tinted pill (faint fill + matching dot/text) so repo health
// reads at a glance, which is the app's core promise.
const DOT_CLASS: Record<ActivityLevel, string> = {
  active: "bg-activity-active",
  maintained: "bg-activity-maintained",
  slow: "bg-activity-slow",
  inactive: "bg-activity-inactive",
};

const PILL_CLASS: Record<ActivityLevel, string> = {
  active: "bg-activity-active/15 text-activity-active",
  maintained: "bg-activity-maintained/15 text-activity-maintained",
  slow: "bg-activity-slow/15 text-activity-slow",
  inactive: "bg-activity-inactive/15 text-activity-inactive",
};

export const ActivityBadge = ({ pushedAt, isArchived }: ActivityBadgeProps) => {
  const activity = getActivityLevel(pushedAt, isArchived);
  const tooltip = pushedAt
    ? `Last push: ${formatDate(pushedAt)}`
    : "No push history";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${PILL_CLASS[activity.level]}`}
      title={tooltip}
    >
      <span
        aria-hidden
        className={`h-1.5 w-1.5 rounded-full ${DOT_CLASS[activity.level]}`}
      />
      {activity.label}
    </span>
  );
};
