import type { TaskStatus } from "@/types/tasks.types";

export const TASK_STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export const STATUS_COLORS: Record<
  TaskStatus,
  "default" | "secondary" | "outline"
> = {
  TODO: "secondary",
  IN_PROGRESS: "default",
  DONE: "outline",
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
