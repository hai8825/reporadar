import { type ActivityLevel, getActivityLevel } from "@/lib/utils/activity";
import { formatDate } from "@/lib/utils/format";

type ActivityBadgeProps = {
  pushedAt: string | null;
  isArchived: boolean;
};

// Theme-aware dot color — the activity ramp is defined per theme in globals.css
const DOT_CLASS: Record<ActivityLevel, string> = {
  active: "bg-activity-active",
  maintained: "bg-activity-maintained",
  slow: "bg-activity-slow",
  inactive: "bg-activity-inactive",
};

// Colored dot + label; native tooltip shows the exact last push date
export const ActivityBadge = ({ pushedAt, isArchived }: ActivityBadgeProps) => {
  const activity = getActivityLevel(pushedAt, isArchived);
  const tooltip = pushedAt
    ? `Last push: ${formatDate(pushedAt)}`
    : "No push history";

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs text-text-secondary"
      title={tooltip}
    >
      <span
        aria-hidden
        className={`h-2 w-2 rounded-full ${DOT_CLASS[activity.level]}`}
      />
      {activity.label}
    </span>
  );
};
