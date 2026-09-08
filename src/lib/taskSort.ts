import type {
  Task,
  TaskSortDirection,
  TaskSortField,
} from "@/types/tasks.types";

export function compareTasks(
  a: Task,
  b: Task,
  field: TaskSortField,
  direction: TaskSortDirection,
): number {
  if (field === "dueDate") {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    const diff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    return direction === "desc" ? -diff : diff;
  }
  if (field === "title") {
    const cmp = a.title.localeCompare(b.title, undefined, {
      sensitivity: "base",
    });
    return direction === "desc" ? -cmp : cmp;
  }
  const cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  return direction === "desc" ? -cmp : cmp;
}
