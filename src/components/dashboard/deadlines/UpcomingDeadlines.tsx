import { Link } from "react-router-dom";
import { FormattedMessage, useIntl, type MessageDescriptor } from "react-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UrgencyIcon } from "../UrgencyIcon";
import type {
  DashboardDeadline,
  DeadlineKind,
  UpcomingDeadlinesProps as Props,
} from "@/types/dashboard.types";

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
                <UrgencyIcon due={d.deadline} />
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
