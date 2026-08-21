import { Skeleton } from "@/components/ui/skeleton";
import type { ProjectActivityTabProps } from "@/types/projects.types";
import { TaskActivityFeed } from "../modals/TaskActivityFeed";
import { TaskActivityGroup } from "../groups/TaskActivityGroup";

export function ActivityTab({ tasks, tasksLoading }: ProjectActivityTabProps) {
  if (tasksLoading) {
    return <Skeleton className="h-40 w-full" />;
  }

  const allActivities = tasks
    .flatMap((t) => t.activities ?? [])
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

  const tasksWithActivity = tasks
    .filter((t) => (t.activities?.length ?? 0) > 0)
    .sort((a, b) => {
      const aLatest = a.activities![a.activities!.length - 1].createdAt;
      const bLatest = b.activities![b.activities!.length - 1].createdAt;
      return new Date(bLatest).getTime() - new Date(aLatest).getTime();
    });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-medium mb-2">All activity</h3>
        <TaskActivityFeed activities={allActivities} />
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">By task</h3>
        {tasksWithActivity.length === 0 ? (
          <p className="text-xs text-muted-foreground">No task activity yet.</p>
        ) : (
          <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
            {tasksWithActivity.map((t) => (
              <TaskActivityGroup
                key={t.id}
                taskTitle={t.title}
                activities={t.activities ?? []}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
