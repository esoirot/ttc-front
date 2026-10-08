import { FormattedMessage } from "react-intl";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectActivities } from "@/hooks/projects/useProjectActivities";
import type { TaskActivity } from "@/types/tasks.types";
import type { ProjectActivityTabProps } from "@/types/projects.types";
import { TaskActivityFeed } from "../modals/TaskActivityFeed";
import { TaskActivityGroup } from "../groups/TaskActivityGroup";

export function ActivityTab({ projectId }: ProjectActivityTabProps) {
  // Newest first, as the server pages them.
  const { items, loading, hasMore, loadMore } = useProjectActivities(projectId);

  if (loading) {
    return <Skeleton className="h-40 w-full" />;
  }

  // The feeds list oldest first and show the newest on top.
  const oldestFirst = [...items].reverse();
  const byTask = new Map<number, { title: string; events: TaskActivity[] }>();
  for (const a of oldestFirst) {
    if (!a.task) continue;
    const group = byTask.get(a.task.id) ?? { title: a.task.title, events: [] };
    group.events.push(a);
    byTask.set(a.task.id, group);
  }
  // Most recently active task first.
  const groups = [...byTask.entries()].reverse();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-medium mb-2">
          <FormattedMessage
            id="projects.activityTab.allActivity"
            defaultMessage="All activity"
          />
        </h3>
        <TaskActivityFeed activities={oldestFirst} />
        {hasMore && (
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => loadMore()}
          >
            <FormattedMessage
              id="projects.activityTab.loadMore"
              defaultMessage="Load more"
            />
          </Button>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">
          <FormattedMessage
            id="projects.activityTab.byTask"
            defaultMessage="By task"
          />
        </h3>
        {groups.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            <FormattedMessage
              id="projects.activityTab.noTaskActivity"
              defaultMessage="No task activity yet."
            />
          </p>
        ) : (
          <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
            {groups.map(([taskId, g]) => (
              <TaskActivityGroup
                key={taskId}
                taskTitle={g.title}
                activities={g.events}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
