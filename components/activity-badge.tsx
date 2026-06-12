import { getActivityLevel } from "@/lib/utils/activity";
import { formatDate } from "@/lib/utils/format";

type ActivityBadgeProps = {
  pushedAt: string | null;
  isArchived: boolean;
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
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: activity.color }}
      />
      {activity.label}
    </span>
  );
};
