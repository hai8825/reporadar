import { type ActivityLevel, getActivityLevel } from "@/lib/utils/activity";
import { formatDate } from "@/lib/utils/format";

type ActivityBadgeProps = {
  pushedAt: string | null;
  isArchived: boolean;
};

// White label + a color-coded dot for the status. The ramp is defined per
// theme in globals.css (Active = the accent / ember).
const DOT_CLASS: Record<ActivityLevel, string> = {
  active: "bg-activity-active",
  maintained: "bg-activity-maintained",
  slow: "bg-activity-slow",
  inactive: "bg-activity-inactive",
};

export const ActivityBadge = ({ pushedAt, isArchived }: ActivityBadgeProps) => {
  const activity = getActivityLevel(pushedAt, isArchived);
  const tooltip = pushedAt
    ? `Last push: ${formatDate(pushedAt)}`
    : "No push history";

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium text-text-primary"
      title={tooltip}
    >
      <span aria-hidden className={`h-2 w-2 rounded-full ${DOT_CLASS[activity.level]}`} />
      {activity.label}
    </span>
  );
};
