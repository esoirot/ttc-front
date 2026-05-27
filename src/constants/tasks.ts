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
