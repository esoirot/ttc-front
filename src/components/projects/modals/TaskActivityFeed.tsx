import { FormattedMessage, useIntl, type IntlShape } from "react-intl";
import { formatTimestamp, secsToHms } from "@/lib/time";
import type { TaskActivity } from "@/types/tasks.types";

function describe(intl: IntlShape, activity: TaskActivity): string {
  try {
    const p = activity.payload
      ? (JSON.parse(activity.payload) as Record<string, unknown>)
      : null;
    switch (activity.type) {
      case "CREATED":
        return intl.formatMessage({
          id: "projects.taskActivityFeed.created",
          defaultMessage: "created this task",
        });
      case "TITLE_CHANGED":
        return intl.formatMessage(
          {
            id: "projects.taskActivityFeed.titleChanged",
            defaultMessage: 'renamed task to "{to}"',
          },
          { to: String(p?.to ?? "") },
        );
      case "DESCRIPTION_CHANGED":
        return intl.formatMessage({
          id: "projects.taskActivityFeed.descriptionChanged",
          defaultMessage: "updated description",
        });
      case "STATUS_CHANGED":
        return intl.formatMessage(
          {
            id: "projects.taskActivityFeed.statusChanged",
            defaultMessage: "changed status from {from} to {to}",
          },
          { from: String(p?.from ?? "?"), to: String(p?.to ?? "?") },
        );
      case "DUE_DATE_SET":
        return p?.to
          ? intl.formatMessage(
              {
                id: "projects.taskActivityFeed.dueDateSet",
                defaultMessage: "set due date to {date}",
              },
              {
                date: intl.formatDate(new Date(String(p.to)), {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }),
              },
            )
          : intl.formatMessage({
              id: "projects.taskActivityFeed.dueDateCleared",
              defaultMessage: "cleared due date",
            });
      case "ASSIGNED":
        return p?.to
          ? intl.formatMessage({
              id: "projects.taskActivityFeed.assigneeChanged",
              defaultMessage: "changed assignee",
            })
          : intl.formatMessage({
              id: "projects.taskActivityFeed.unassigned",
              defaultMessage: "unassigned task",
            });
      case "CHECKLIST_CREATED":
        return intl.formatMessage(
          {
            id: "projects.taskActivityFeed.checklistCreated",
            defaultMessage: 'created checklist "{title}"',
          },
          { title: String(p?.title ?? "") },
        );
      case "CHECKLIST_ADDED":
        return intl.formatMessage(
          {
            id: "projects.taskActivityFeed.checklistItemAdded",
            defaultMessage: 'added checklist item "{title}"',
          },
          { title: String(p?.title ?? "") },
        );
      case "CHECKLIST_RENAMED":
        return intl.formatMessage(
          {
            id: "projects.taskActivityFeed.checklistRenamed",
            defaultMessage: 'renamed checklist "{from}" to "{to}"',
          },
          { from: String(p?.from ?? ""), to: String(p?.to ?? "") },
        );
      case "CHECKLIST_ITEM_TOGGLED":
        return p?.done
          ? intl.formatMessage(
              {
                id: "projects.taskActivityFeed.checklistItemChecked",
                defaultMessage: 'checked "{title}" in checklist "{list}"',
              },
              {
                title: String(p?.title ?? ""),
                list: String(p?.checklistTitle ?? "Checklist"),
              },
            )
          : intl.formatMessage(
              {
                id: "projects.taskActivityFeed.checklistItemUnchecked",
                defaultMessage: 'unchecked "{title}" in checklist "{list}"',
              },
              {
                title: String(p?.title ?? ""),
                list: String(p?.checklistTitle ?? "Checklist"),
              },
            );
      case "CHECKLIST_UPDATED":
        return intl.formatMessage(
          {
            id: "projects.taskActivityFeed.checklistItemUpdated",
            defaultMessage: 'updated checklist item "{title}"',
          },
          { title: String(p?.title ?? "") },
        );
      case "CHECKLIST_DELETED":
        return intl.formatMessage(
          {
            id: "projects.taskActivityFeed.checklistItemRemoved",
            defaultMessage: 'removed checklist item "{title}"',
          },
          { title: String(p?.title ?? "") },
        );
      case "CHECKLIST_REMOVED":
        return intl.formatMessage(
          {
            id: "projects.taskActivityFeed.checklistDeleted",
            defaultMessage: 'deleted checklist "{title}"',
          },
          { title: String(p?.title ?? "") },
        );
      case "ATTACHMENT_ADDED":
        return intl.formatMessage(
          {
            id: "projects.taskActivityFeed.attachmentAdded",
            defaultMessage: 'attached "{name}"',
          },
          { name: String(p?.name ?? p?.url ?? "file") },
        );
      case "ATTACHMENT_UPDATED":
        return intl.formatMessage(
          {
            id: "projects.taskActivityFeed.attachmentUpdated",
            defaultMessage: 'updated attachment "{name}"',
          },
          { name: String(p?.name ?? p?.url ?? "file") },
        );
      case "ATTACHMENT_DELETED":
        return intl.formatMessage(
          {
            id: "projects.taskActivityFeed.attachmentRemoved",
            defaultMessage: 'removed attachment "{name}"',
          },
          { name: String(p?.name ?? p?.url ?? "file") },
        );
      case "COMMENT_ADDED":
        return intl.formatMessage({
          id: "projects.taskActivityFeed.commentAdded",
          defaultMessage: "added a comment",
        });
      case "COMMENT_EDITED":
        return intl.formatMessage({
          id: "projects.taskActivityFeed.commentEdited",
          defaultMessage: "edited a comment",
        });
      case "COMMENT_DELETED":
        return intl.formatMessage({
          id: "projects.taskActivityFeed.commentDeleted",
          defaultMessage: "deleted a comment",
        });
      case "LABEL_ADDED":
        return intl.formatMessage(
          {
            id: "projects.taskActivityFeed.labelAdded",
            defaultMessage: 'added label "{name}"',
          },
          { name: String(p?.name ?? "") },
        );
      case "LABEL_REMOVED":
        return intl.formatMessage(
          {
            id: "projects.taskActivityFeed.labelRemoved",
            defaultMessage: 'removed label "{name}"',
          },
          { name: String(p?.name ?? "") },
        );
      case "STARTED":
        return p?.description
          ? intl.formatMessage(
              {
                id: "projects.taskActivityFeed.startedWithDescription",
                defaultMessage: 'started time tracking on "{description}"',
              },
              { description: String(p.description) },
            )
          : intl.formatMessage({
              id: "projects.taskActivityFeed.started",
              defaultMessage: "started time tracking",
            });
      case "STOPPED": {
        const duration =
          typeof p?.durationSeconds === "number"
            ? ` (${secsToHms(p.durationSeconds)})`
            : "";
        return p?.description
          ? intl.formatMessage(
              {
                id: "projects.taskActivityFeed.stoppedWithDescription",
                defaultMessage:
                  'stopped time tracking on "{description}"{duration}',
              },
              { description: String(p.description), duration },
            )
          : intl.formatMessage(
              {
                id: "projects.taskActivityFeed.stopped",
                defaultMessage: "stopped time tracking{duration}",
              },
              { duration },
            );
      }
      case "RESUMED":
        return intl.formatMessage({
          id: "projects.taskActivityFeed.resumed",
          defaultMessage: "resumed time tracking",
        });
      case "DELETED":
        return p?.durationSeconds
          ? intl.formatMessage(
              {
                id: "projects.taskActivityFeed.deletedWithDuration",
                defaultMessage: "deleted a time entry ({duration})",
              },
              { duration: secsToHms(Number(p.durationSeconds)) },
            )
          : intl.formatMessage({
              id: "projects.taskActivityFeed.deleted",
              defaultMessage: "deleted a time entry",
            });
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
  const intl = useIntl();
  if (activities.length === 0) {
    return (
      <div className="text-xs text-muted-foreground">
        <FormattedMessage
          id="projects.taskActivityFeed.empty"
          defaultMessage="No activity yet."
        />
      </div>
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
                {a.user?.name ??
                  intl.formatMessage(
                    {
                      id: "clients.statusHistory.userFallback",
                      defaultMessage: "User {id}",
                    },
                    { id: a.userId },
                  )}
              </span>{" "}
              <span className="text-muted-foreground">{describe(intl, a)}</span>
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
