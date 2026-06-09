import { Badge } from "@/components/ui/badge";
import { useDeleteTaskLabel } from "@/hooks/tasks/useTasks";
import type { TaskLabel } from "@/types/tasks.types";

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
          <button
            onClick={() => void deleteLabel(l.id)}
            className="hover:opacity-70 leading-none"
          >
            ✕
          </button>
        </Badge>
      ))}
    </div>
  );
}
