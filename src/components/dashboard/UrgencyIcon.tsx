import { useIntl } from "react-intl";
import { Calendar, Clock, TriangleAlert } from "lucide-react";

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Whole calendar days from today to the due date (negative when late). */
function daysUntil(iso: string, now = new Date()): number {
  return Math.round(
    (startOfDay(new Date(iso)).getTime() - startOfDay(now).getTime()) / DAY_MS,
  );
}

/**
 * Red triangle when late (or due now: `due` null), yellow clock up to a week
 * ahead, green calendar after that.
 */
export function UrgencyIcon({ due }: { due: string | null }) {
  const intl = useIntl();
  const days = due === null ? -1 : daysUntil(due);
  const [Icon, className, label] =
    days < 0
      ? ([
          TriangleAlert,
          "text-destructive",
          intl.formatMessage({
            id: "dashboard.urgency.late",
            defaultMessage: "Late",
          }),
        ] as const)
      : days <= 7
        ? ([
            Clock,
            "text-amber-500",
            intl.formatMessage({
              id: "dashboard.urgency.thisWeek",
              defaultMessage: "Due within a week",
            }),
          ] as const)
        : ([
            Calendar,
            "text-emerald-600",
            intl.formatMessage({
              id: "dashboard.urgency.later",
              defaultMessage: "Upcoming",
            }),
          ] as const);
  return (
    <Icon
      role="img"
      aria-label={label}
      className={`size-4 shrink-0 ${className}`}
    />
  );
}
