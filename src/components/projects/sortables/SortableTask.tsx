import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { SortableTaskProps } from "@/types/projects.types";
import { renderAssigneeDisplay } from "@/hooks/tasks/useTaskDisplay";
import { useSortableItem } from "@/hooks/projects/useSortableItem";

export function SortableTask({
  task,
  onDelete,
  onOpenModal,
  memberMap,
}: SortableTaskProps) {
  const { setNodeRef, style, attributes, listeners } = useSortableItem(
    task.id,
    0,
  );

  const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() : false;

  return (
    <div ref={setNodeRef} style={style} className="mb-2 relative">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-1 right-1 h-5 w-5 p-0 z-10 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-sm"
            onClick={(e) => e.stopPropagation()}
            aria-label="Delete task"
          >
            ✕
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete <strong>{task.title}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => onDelete(task.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card
        className="cursor-pointer hover:bg-accent/30 transition-colors"
        onClick={() => onOpenModal(task.id)}
      >
        <CardContent className="py-2 px-3 pr-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="cursor-grab h-6 px-1 text-muted-foreground hover:text-foreground shrink-0"
              {...attributes}
              {...listeners}
              aria-label="Drag to reorder"
              tabIndex={0}
              onClick={(e) => e.stopPropagation()}
            >
              ⠿
            </Button>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{task.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {renderAssigneeDisplay(task.assigneeId, memberMap)}
                {task.dueDate && (
                  <span
                    className={`text-xs ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}
                  >
                    {task.dueDate.slice(0, 10)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
