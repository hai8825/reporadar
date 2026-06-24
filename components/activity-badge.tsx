import { type ActivityLevel, getActivityLevel } from "@/lib/utils/activity";
import { formatDate } from "@/lib/utils/format";

type ActivityBadgeProps = {
  pushedAt: string | null;
  isArchived: boolean;
};

// White label + a colour-coded dot. Coloured label text fails AA on the lighter
// card body (list view) and in the violet default theme, so the colour lives in
// graphical elements — this dot and the card's status cap — while the word stays
// white. Ramp is defined per theme in globals.css.
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
