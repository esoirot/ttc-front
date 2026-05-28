import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { SortableRowProps } from "@/types/projects.types";
import { TASK_STATUSES, STATUS_LABELS, STATUS_COLORS } from "@/constants/tasks";
import { useSortableItem } from "@/hooks/projects/useSortableItem";

export function SortableRow({
  task,
  selected,
  editingId,
  form,
  saving,
  members,
  onSelect,
  onStartEdit,
  onSave,
  onCancelEdit,
  onDelete,
  setForm,
}: SortableRowProps) {
  const { setNodeRef, style, attributes, listeners } = useSortableItem(task.id);

  if (editingId === task.id) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="border border-border rounded-lg p-3 bg-card flex flex-col gap-2"
      >
        <div className="flex flex-col gap-1">
          <Label htmlFor={`ptl-title-${task.id}`}>Title</Label>
          <Input
            id={`ptl-title-${task.id}`}
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor={`ptl-desc-${task.id}`}>Description</Label>
          <Input
            id={`ptl-desc-${task.id}`}
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor={`ptl-status-${task.id}`}>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, status: v as TaskStatus }))
              }
            >
              <SelectTrigger id={`ptl-status-${task.id}`} className="w-[140px]">
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
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor={`ptl-due-${task.id}`}>Due date</Label>
            <Input
              id={`ptl-due-${task.id}`}
              type="date"
              value={form.dueDate}
              onChange={(e) =>
                setForm((p) => ({ ...p, dueDate: e.target.value }))
              }
              className="w-[150px]"
            />
          </div>
          <div className="hidden">
            <Label htmlFor={`ptl-assignee-${task.id}`}>Assignee</Label>
            <Select
              value={form.assigneeId || "__none__"}
              onValueChange={(v) =>
                setForm((p) => ({
                  ...p,
                  assigneeId: v === "__none__" ? "" : v,
                }))
              }
            >
              <SelectTrigger
                id={`ptl-assignee-${task.id}`}
                className="w-[140px]"
              >
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No assignee</SelectItem>
                {members.map((m) => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    {m.name ?? m.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" disabled={saving} onClick={() => onSave(task.id)}>
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancelEdit}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-border rounded-lg p-3 bg-card flex items-center gap-2"
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
      <div
        className="flex-1 cursor-pointer min-w-0"
        onClick={() => onStartEdit(task)}
      >
        <p className="font-medium truncate">{task.title}</p>
        {task.dueDate && (
          <p className="text-xs text-muted-foreground">
            Due {task.dueDate.slice(0, 10)}
          </p>
        )}
      </div>
      <Badge variant={STATUS_COLORS[task.status as TaskStatus] ?? "secondary"}>
        {STATUS_LABELS[task.status as TaskStatus] ?? task.status}
      </Badge>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-muted-foreground hover:text-foreground"
        onClick={(e) => {
          e.stopPropagation();
          onStartEdit(task);
        }}
      >
        ✎
      </Button>
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
