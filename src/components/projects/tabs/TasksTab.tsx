import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIntl } from "react-intl";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  Task,
  TaskStatus,
  TaskSortField,
  TaskSortDirection,
} from "@/types/tasks.types";
import type { TasksTabProps } from "@/types/projects.types";
import { TASK_STATUSES, STATUS_LABEL_MESSAGES } from "@/constants/tasks";
import { compareTasks } from "@/lib/taskSort";
import { useDeleteTask, useUpdateTask } from "@/hooks/tasks/useTasks";
import { SortableTask } from "../sortables/SortableTask";
import { TaskToolbar } from "../filters/TaskToolbar";

export function DroppableColumn({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="min-h-15">
      {children}
    </div>
  );
}

export function TasksTab({
  projectId,
  tasks,
  tasksLoading,
  taskHasMore,
  taskLoadMore,
  memberMap,
  onOpenModal,
}: TasksTabProps) {
  const navigate = useNavigate();
  const intl = useIntl();
  const { updateTask } = useUpdateTask(projectId);
  const { deleteTask } = useDeleteTask(projectId);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );
  const [activeId, setActiveId] = useState<number | null>(null);
  const [localOrders, setLocalOrders] = useState<
    Partial<Record<TaskStatus, number[]>>
  >({});
  const [dueFrom, setDueFrom] = useState("");
  const [dueTo, setDueTo] = useState("");
  const [sortField, setSortField] = useState<TaskSortField>("dueDate");
  const [sortDirection, setSortDirection] = useState<TaskSortDirection>("desc");
  const dueDateFilterActive = dueFrom !== "" || dueTo !== "";
  const filteredTasks = (
    dueDateFilterActive
      ? tasks.filter((t) => {
          if (!t.dueDate) return false;
          const due = t.dueDate.slice(0, 10);
          if (dueFrom && due < dueFrom) return false;
          if (dueTo && due > dueTo) return false;
          return true;
        })
      : tasks
  )
    .slice()
    .sort((a, b) => compareTasks(a, b, sortField, sortDirection));
  const activeTask =
    activeId !== null ? (tasks.find((t) => t.id === activeId) ?? null) : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(Number(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const task = tasks.find((t) => t.id === Number(active.id));
    if (!task) return;

    // over.id is either a task id (number coerced to string) or a column status string
    const targetStatus: TaskStatus | undefined = (
      TASK_STATUSES as readonly string[]
    ).includes(String(over.id))
      ? (over.id as TaskStatus)
      : tasks.find((t) => t.id === Number(over.id))?.status;

    if (targetStatus && task.status !== targetStatus) {
      void updateTask({ id: task.id, status: targetStatus });
    } else if (targetStatus && task.status === targetStatus) {
      const ids = tasksByStatus[targetStatus].map((t) => t.id);
      const oldIndex = ids.indexOf(task.id);
      const newIndex = ids.indexOf(Number(over.id));
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(ids, oldIndex, newIndex);
      setLocalOrders((prev) => ({ ...prev, [targetStatus]: reordered }));
      void updateTask({ id: task.id, sortOrder: newIndex });
    }
  }

  const tasksByStatus = TASK_STATUSES.reduce<Record<TaskStatus, Task[]>>(
    (acc, s) => ({
      ...acc,
      [s]: filteredTasks.filter((t) => t.status === s),
    }),
    { TODO: [], IN_PROGRESS: [], DONE: [], PAID: [] },
  );

  function orderedTasksForStatus(status: TaskStatus): Task[] {
    const base = tasksByStatus[status];
    const order = localOrders[status];
    if (!order) return base;
    const byId = new Map(base.map((t) => [t.id, t]));
    const ordered = order
      .map((id) => byId.get(id))
      .filter((t): t is Task => t !== undefined);
    const extra = base.filter((t) => !order.includes(t.id));
    return [...ordered, ...extra];
  }

  return (
    <>
      <div className="mb-4">
        <TaskToolbar
          idPrefix="task"
          dueFrom={dueFrom}
          dueTo={dueTo}
          onDueFromChange={setDueFrom}
          onDueToChange={setDueTo}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortFieldChange={setSortField}
          onSortDirectionChange={setSortDirection}
          onNewTask={() => navigate(`/projects/${projectId}/tasks/new`)}
        />
      </div>

      {tasksLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div
              role="region"
              aria-label="Kanban board"
              tabIndex={0}
              className="overflow-x-auto pb-2"
            >
              <div className="grid min-w-3xl grid-cols-4 gap-4">
                {TASK_STATUSES.map((status) => (
                  <div key={status}>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                      {intl.formatMessage(STATUS_LABEL_MESSAGES[status])}
                    </h3>
                    <DroppableColumn id={status}>
                      <SortableContext
                        items={orderedTasksForStatus(status).map((t) => t.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {orderedTasksForStatus(status).map((task) => (
                          <SortableTask
                            key={task.id}
                            task={task}
                            onDelete={(tid) => void deleteTask(tid)}
                            onOpenModal={onOpenModal}
                            memberMap={memberMap}
                          />
                        ))}
                      </SortableContext>
                      {tasksByStatus[status].length === 0 && (
                        <p className="text-muted-foreground text-xs text-center py-4">
                          Empty
                        </p>
                      )}
                    </DroppableColumn>
                  </div>
                ))}
              </div>
            </div>
            <DragOverlay dropAnimation={null}>
              {activeTask && (
                <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg text-sm font-medium opacity-90 cursor-grabbing">
                  {activeTask.title}
                </div>
              )}
            </DragOverlay>
          </DndContext>
          {taskHasMore && (
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={taskLoadMore}
            >
              Load more tasks
            </Button>
          )}
        </>
      )}
    </>
  );
}
