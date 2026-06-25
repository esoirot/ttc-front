import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { TaskStatus } from "@/types/tasks.types";
import type { SortableRowProps } from "@/types/projects.types";
import {
  STATUS_LABELS,
  STATUS_VARIANTS,
  STATUS_BADGE_CLASSES,
} from "@/constants/tasks";
import { useSortableItem } from "@/hooks/projects/useSortableItem";

export function SortableRow({
  task,
  selected,
  onSelect,
  onOpenModal,
  onDelete,
}: SortableRowProps) {
  const { setNodeRef, style, attributes, listeners } = useSortableItem(task.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-border rounded-lg p-3 bg-card flex items-center gap-2 cursor-pointer hover:bg-accent/30 transition-colors"
      onClick={() => onOpenModal(task.id)}
    >
      <Button
        variant="ghost"
        size="sm"
        className="cursor-grab h-7 px-1 text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        onClick={(e) => e.stopPropagation()}
      >
        ⠿
      </Button>
      <Checkbox
        checked={selected}
        onCheckedChange={(checked) => onSelect(task.id, !!checked)}
        aria-label={`Select ${task.title}`}
        onClick={(e) => e.stopPropagation()}
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{task.title}</p>
        {task.dueDate && (
          <p className="text-xs text-muted-foreground">
            Due {task.dueDate.slice(0, 10)}
          </p>
        )}
      </div>
      <Badge
        variant={STATUS_VARIANTS[task.status as TaskStatus] ?? "outline"}
        className={STATUS_BADGE_CLASSES[task.status as TaskStatus]}
      >
        {STATUS_LABELS[task.status as TaskStatus] ?? task.status}
      </Badge>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-destructive hover:text-destructive"
            onClick={(e) => e.stopPropagation()}
          >
            ✕
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{task.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone.
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
    </div>
  );
}
