import { Link } from "react-router-dom";
import { FormattedMessage, useIntl, type MessageDescriptor } from "react-intl";
import { Calendar, Clock, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  DashboardDeadline,
  DeadlineKind,
  UpcomingDeadlinesProps as Props,
} from "@/types/dashboard.types";

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Whole calendar days from today to the due date (negative when late). */
function daysUntil(iso: string, now = new Date()): number {
  return Math.round(
    (startOfDay(new Date(iso)).getTime() - startOfDay(now).getTime()) / DAY_MS,
  );
}

const localDate = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const KIND_LABELS: Record<DeadlineKind, MessageDescriptor> = {
  PROJECT: {
    id: "dashboard.upcomingDeadlines.kind.project",
    defaultMessage: "Project",
  },
  TASK: { id: "dashboard.upcomingDeadlines.kind.task", defaultMessage: "Task" },
  CHECKLIST_ITEM: {
    id: "dashboard.upcomingDeadlines.kind.checklistItem",
    defaultMessage: "Checklist item",
  },
};

function UrgencyIcon({ deadline }: { deadline: string }) {
  const intl = useIntl();
  const days = daysUntil(deadline);
  const [Icon, className, label] =
    days < 0
      ? ([
          TriangleAlert,
          "text-destructive",
          intl.formatMessage({
            id: "dashboard.upcomingDeadlines.late",
            defaultMessage: "Late",
          }),
        ] as const)
      : days <= 7
        ? ([
            Clock,
            "text-amber-500",
            intl.formatMessage({
              id: "dashboard.upcomingDeadlines.thisWeek",
              defaultMessage: "Due within a week",
            }),
          ] as const)
        : ([
            Calendar,
            "text-emerald-600",
            intl.formatMessage({
              id: "dashboard.upcomingDeadlines.later",
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

function href(d: DashboardDeadline): string {
  return d.taskId === null
    ? `/projects/${d.projectId}`
    : `/projects/${d.projectId}?task=${d.taskId}`;
}

export function UpcomingDeadlines({ deadlines }: Props) {
  const intl = useIntl();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">
          <FormattedMessage
            id="dashboard.upcomingDeadlines.title"
            defaultMessage="Upcoming Deadlines"
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {deadlines.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            <FormattedMessage
              id="dashboard.upcomingDeadlines.emptyAll"
              defaultMessage="Nothing overdue or due in the next 30 days."
            />
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {deadlines.map((d) => (
              <Link
                key={`${d.kind}-${d.id}`}
                to={href(d)}
                className="flex items-center gap-3 py-1 hover:opacity-80 transition-opacity"
              >
                <UrgencyIcon deadline={d.deadline} />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{d.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {[
                      intl.formatMessage(KIND_LABELS[d.kind]),
                      d.kind === "CHECKLIST_ITEM" ? d.taskTitle : null,
                      d.kind === "PROJECT" ? null : d.projectTitle,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                    {" — "}
                    <FormattedMessage
                      id="dashboard.upcomingDeadlines.due"
                      defaultMessage="Due {date}"
                      values={{ date: localDate(d.deadline) }}
                    />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
