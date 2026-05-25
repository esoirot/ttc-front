import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { Member } from "@/types/users.types";
import type { SortableTaskProps } from "@/types/projects.types";
import { TASK_STATUSES, STATUS_LABELS } from "@/constants/tasks";

export function SortableTask({
  task,
  onStatusChange,
  onDelete,
  onUpdate,
  memberMap,
  members,
}: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() : false;
  const [editing, setEditing] = useState(false);
  const [editAssigneeId, setEditAssigneeId] = useState(
    String(task.assigneeId ?? ""),
  );
  const [editDueDate, setEditDueDate] = useState(
    task.dueDate?.slice(0, 10) ?? "",
  );

  function handleSave() {
    onUpdate(
      task.id,
      editAssigneeId ? Number(editAssigneeId) : undefined,
      editDueDate || undefined,
    );
    setEditing(false);
  }

  function handleStartEdit() {
    setEditAssigneeId(String(task.assigneeId ?? ""));
    setEditDueDate(task.dueDate?.slice(0, 10) ?? "");
    setEditing(true);
  }

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

      <Card>
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
            >
              ⠿
            </Button>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{task.title}</p>
              {!editing && (
                <div className="flex items-center gap-2 mt-0.5">
                  {task.assigneeId && memberMap[task.assigneeId] && (
                    <span className="text-xs text-muted-foreground">
                      @{memberMap[task.assigneeId]}
                    </span>
                  )}
                  {task.dueDate && (
                    <span
                      className={`text-xs ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}
                    >
                      {task.dueDate.slice(0, 10)}
                    </span>
                  )}
                </div>
              )}
            </div>
            {!editing && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-1 text-muted-foreground hover:text-foreground shrink-0"
                onClick={handleStartEdit}
                aria-label="Edit task"
              >
                ✎
              </Button>
            )}
          </div>

          {editing && (
            <div className="mt-2 flex flex-col gap-2">
              <Select
                value={editAssigneeId || "__none__"}
                onValueChange={(val) =>
                  setEditAssigneeId(val === "__none__" ? "" : val)
                }
              >
                <SelectTrigger
                  size="sm"
                  className="w-full h-7 text-xs"
                  aria-label="Assignee"
                >
                  <SelectValue placeholder="Assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No assignee</SelectItem>
                  {members.map((m: Member) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {m.name ?? m.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={task.status}
                onValueChange={(val) =>
                  onStatusChange(task.id, val as TaskStatus)
                }
              >
                <SelectTrigger size="sm" className="w-full h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                aria-label="Due date"
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="h-7 text-xs"
              />

              <div className="flex gap-1">
                <Button
                  size="sm"
                  className="h-7 text-xs flex-1"
                  onClick={handleSave}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
