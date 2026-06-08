import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
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
import type { ProjectTaskListProps } from "@/types/projects.types";
import { TASK_STATUSES, STATUS_LABELS } from "@/constants/tasks";
import { useProjectTaskList } from "@/hooks/projects/useProjectTaskList";
import { SortableRow } from "../rows/SortableRow";

interface Props extends ProjectTaskListProps {
  onOpenModal: (taskId: number) => void;
}

export function ProjectTaskList({ projectId, members, onOpenModal }: Props) {
  const {
    loading,
    hasMore,
    loadMore,
    createLoading,
    deleteTask,
    statusFilter,
    setStatusFilter,
    selected,
    bulkStatus,
    setBulkStatus,
    showCreate,
    setShowCreate,
    newTitle,
    setNewTitle,
    sensors,
    filtered,
    allSelected,
    handleCreate,
    handleSelect,
    handleSelectAll,
    handleBulkDelete,
    handleBulkStatus,
    handleDragEnd,
  } = useProjectTaskList({ projectId, members });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor="ptl-filter" className="sr-only">
            Filter by status
          </Label>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as TaskStatus | "ALL")}
          >
            <SelectTrigger id="ptl-filter" className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {TASK_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowCreate(true)}>
          + New task
        </Button>
      </div>

      {showCreate && (
        <div className="border border-border rounded-lg p-3 bg-card flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
            <Label htmlFor="ptl-new-title">Title</Label>
            <Input
              id="ptl-new-title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Task title"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleCreate();
                if (e.key === "Escape") {
                  setShowCreate(false);
                  setNewTitle("");
                }
              }}
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={createLoading || !newTitle.trim()}
              onClick={() => void handleCreate()}
            >
              {createLoading ? "Creating…" : "Create"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowCreate(false);
                setNewTitle("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {selected.size > 0 && (
        <div className="flex items-center gap-2 p-2 border border-border rounded-lg bg-muted">
          <span className="text-sm text-muted-foreground">
            {selected.size} selected
          </span>
          <div className="flex items-center gap-1 ml-auto">
            <Label htmlFor="ptl-bulk-status" className="sr-only">
              Bulk status
            </Label>
            <Select
              value={bulkStatus}
              onValueChange={(v) => setBulkStatus(v as TaskStatus)}
            >
              <SelectTrigger
                id="ptl-bulk-status"
                className="w-[130px] h-7 text-xs"
              >
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
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => void handleBulkStatus()}
            >
              Set status
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive" className="h-7 text-xs">
                  Delete selected
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Delete {selected.size} task{selected.size > 1 ? "s" : ""}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => void handleBulkDelete()}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm">No tasks.</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 px-3 py-1 text-xs text-muted-foreground">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => handleSelectAll(!!checked)}
                aria-label="Select all"
              />
              <span>Select all</span>
            </div>
            <SortableContext
              items={filtered.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {filtered.map((task) => (
                <SortableRow
                  key={task.id}
                  task={task}
                  selected={selected.has(task.id)}
                  onSelect={handleSelect}
                  onOpenModal={onOpenModal}
                  onDelete={(id) => void deleteTask(id)}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>
      )}

      {hasMore && (
        <Button
          variant="outline"
          className="mt-2 self-center"
          onClick={loadMore}
        >
          Load more
        </Button>
      )}
    </div>
  );
}
