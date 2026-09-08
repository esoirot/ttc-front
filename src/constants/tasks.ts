import type { TaskSortField, TaskStatus } from "@/types/tasks.types";

export const TASK_STATUSES: TaskStatus[] = [
  "TODO",
  "IN_PROGRESS",
  "DONE",
  "PAID",
];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
  PAID: "Paid",
};

export const STATUS_VARIANTS: Record<TaskStatus, "default" | "outline"> = {
  TODO: "outline",
  IN_PROGRESS: "default",
  DONE: "outline",
  PAID: "outline",
};

export const STATUS_BADGE_CLASSES: Record<TaskStatus, string> = {
  TODO: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  IN_PROGRESS: "",
  DONE: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  PAID: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30",
};

export const TASK_SORT_FIELDS: TaskSortField[] = [
  "dueDate",
  "title",
  "createdAt",
];

export const TASK_SORT_FIELD_LABELS: Record<TaskSortField, string> = {
  dueDate: "Due date",
  title: "Task name",
  createdAt: "Created",
};

export const PRESET_COLORS = [
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#6B7280",
];
