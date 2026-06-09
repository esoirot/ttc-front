import { formatTimestamp } from "@/lib/time";
import type { TaskActivity } from "@/types/tasks.types";

function describe(activity: TaskActivity): string {
  try {
    const p = activity.payload
      ? (JSON.parse(activity.payload) as Record<string, unknown>)
      : null;
    switch (activity.type) {
      case "CREATED":
        return "created this task";
      case "TITLE_CHANGED":
        return `renamed task to "${String(p?.to ?? "")}"`;
      case "DESCRIPTION_CHANGED":
        return "updated description";
      case "STATUS_CHANGED":
        return `changed status from ${String(p?.from ?? "?")} to ${String(p?.to ?? "?")}`;
      case "DUE_DATE_SET":
        return p?.to
          ? `set due date to ${new Date(String(p.to)).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`
          : "cleared due date";
      case "ASSIGNED":
        return p?.to ? `changed assignee` : "unassigned task";
      case "CHECKLIST_CREATED":
        return `created checklist "${String(p?.title ?? "")}"`;
      case "CHECKLIST_ADDED":
        return `added checklist item "${String(p?.title ?? "")}"`;
      case "CHECKLIST_RENAMED":
        return `renamed checklist "${String(p?.from ?? "")}" to "${String(p?.to ?? "")}"`;
      case "CHECKLIST_ITEM_TOGGLED":
        return p?.done
          ? `checked "${String(p?.title ?? "")}" in checklist "${String(p?.checklistTitle ?? "Checklist")}"`
          : `unchecked "${String(p?.title ?? "")}" in checklist "${String(p?.checklistTitle ?? "Checklist")}"`;
      case "CHECKLIST_UPDATED":
        return `updated checklist item "${String(p?.title ?? "")}"`;
      case "CHECKLIST_DELETED":
        return `removed checklist item "${String(p?.title ?? "")}"`;
      case "CHECKLIST_REMOVED":
        return `deleted checklist "${String(p?.title ?? "")}"`;
      case "ATTACHMENT_ADDED":
        return `attached "${String(p?.name ?? p?.url ?? "file")}"`;
      case "COMMENT_ADDED":
        return "added a comment";
      case "COMMENT_EDITED":
        return "edited a comment";
      case "COMMENT_DELETED":
        return "deleted a comment";
      case "LABEL_ADDED":
        return `added label "${String(p?.name ?? "")}"`;
      case "LABEL_REMOVED":
        return `removed label "${String(p?.name ?? "")}"`;
      default:
        return activity.type.toLowerCase().replace(/_/g, " ");
    }
  } catch {
    return activity.type;
  }
}

export function TaskActivityFeed({
  activities,
}: {
  activities: TaskActivity[];
}) {
  if (activities.length === 0) {
    return (
      <div className="text-xs text-muted-foreground">No activity yet.</div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {[...activities].reverse().map((a) => (
        <div key={a.id} className="flex gap-2 text-xs">
          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0 text-[10px] font-medium text-muted-foreground mt-0.5">
            {(a.user?.name ?? "?")[0]?.toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span>
              <span className="font-medium text-foreground">
                {a.user?.name ?? `User ${a.userId}`}
              </span>{" "}
              <span className="text-muted-foreground">{describe(a)}</span>
            </span>
            <span className="text-muted-foreground">
              {formatTimestamp(a.createdAt)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
