import { Badge } from "@/components/ui/badge";
import { useDeleteTaskLabel } from "@/hooks/tasks/useTasks";
import type { TaskLabel } from "@/types/tasks.types";
import { Button } from "@/components/ui/button";

export function TaskLabelBadges({
  taskId,
  labels,
}: {
  taskId: number;
  labels: TaskLabel[];
}) {
  const { deleteLabel } = useDeleteTaskLabel(taskId);
  if (!labels.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {labels.map((l) => (
        <Badge
          key={l.id}
          style={{ backgroundColor: l.color }}
          className="text-white text-xs gap-1 cursor-default"
        >
          {l.name}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => void deleteLabel(l.id)}
            className="size-4 rounded-sm text-inherit hover:bg-background/30 hover:text-inherit"
          >
            ✕
          </Button>
        </Badge>
      ))}
    </div>
  );
}
