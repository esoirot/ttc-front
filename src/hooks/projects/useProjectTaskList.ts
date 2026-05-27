import { useState } from "react";
import { useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from "@/hooks/tasks/useTasks";
import type { Task, TaskStatus } from "@/types/tasks.types";
import type {
  TaskEditForm,
  ProjectTaskListProps,
} from "@/types/projects.types";

function defaultForm(task: Task): TaskEditForm {
  return {
    title: task.title,
    description: task.description ?? "",
    status: task.status,
    dueDate: task.dueDate?.slice(0, 10) ?? "",
    assigneeId: task.assigneeId ? String(task.assigneeId) : "",
  };
}

export function useProjectTaskList({
  projectId,
  members,
}: ProjectTaskListProps) {
  const { tasks, loading, hasMore, loadMore } = useTasks(projectId);
  const { createTask, loading: createLoading } = useCreateTask(projectId);
  const { updateTask, loading: saving } = useUpdateTask(projectId);
  const { deleteTask } = useDeleteTask(projectId);

  const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<TaskEditForm>({
    title: "",
    description: "",
    status: "TODO",
    dueDate: "",
    assigneeId: "",
  });
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<TaskStatus>("TODO");
  const [localOrder, setLocalOrder] = useState<number[] | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const sensors = useSensors(useSensor(PointerSensor));

  const displayTasks = localOrder
    ? localOrder
        .map((id) => tasks.find((t) => t.id === id))
        .filter((t): t is Task => t !== undefined)
    : tasks;

  const filtered =
    statusFilter === "ALL"
      ? displayTasks
      : displayTasks.filter((t) => t.status === statusFilter);

  const allSelected =
    filtered.length > 0 && filtered.every((t) => selected.has(t.id));

  async function handleCreate() {
    if (!newTitle.trim()) return;
    await createTask({ projectId, title: newTitle.trim() });
    setNewTitle("");
    setShowCreate(false);
  }

  function handleStartEdit(task: Task) {
    setForm(defaultForm(task));
    setEditingId(task.id);
  }

  async function handleSave(taskId: number) {
    await updateTask({
      id: taskId,
      title: form.title || undefined,
      description: form.description || undefined,
      status: form.status,
      dueDate: form.dueDate || undefined,
      assigneeId: form.assigneeId ? Number(form.assigneeId) : undefined,
    });
    setEditingId(null);
  }

  function handleSelect(id: number, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function handleSelectAll(checked: boolean) {
    setSelected(checked ? new Set(filtered.map((t) => t.id)) : new Set());
  }

  async function handleBulkDelete() {
    for (const id of selected) {
      await deleteTask(id);
    }
    setSelected(new Set());
  }

  async function handleBulkStatus() {
    for (const id of selected) {
      await updateTask({ id, status: bulkStatus });
    }
    setSelected(new Set());
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const ids = filtered.map((t) => t.id);
    const oldIndex = ids.indexOf(active.id as number);
    const newIndex = ids.indexOf(over.id as number);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(ids, oldIndex, newIndex);
    const allIds = tasks.map((t) => t.id);
    setLocalOrder(
      reordered.concat(allIds.filter((id) => !reordered.includes(id))),
    );

    void updateTask({ id: active.id as number, sortOrder: newIndex });
  }

  return {
    tasks,
    loading,
    hasMore,
    loadMore,
    createLoading,
    saving,
    deleteTask,
    statusFilter,
    setStatusFilter,
    editingId,
    setEditingId,
    form,
    setForm,
    selected,
    bulkStatus,
    setBulkStatus,
    localOrder,
    showCreate,
    setShowCreate,
    newTitle,
    setNewTitle,
    sensors,
    filtered,
    allSelected,
    members,
    handleCreate,
    handleStartEdit,
    handleSave,
    handleSelect,
    handleSelectAll,
    handleBulkDelete,
    handleBulkStatus,
    handleDragEnd,
  };
}
