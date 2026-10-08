import type { Connection } from "./common.types";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "PAID";

export type TaskSortField = "createdAt" | "title" | "dueDate";
export type TaskSortDirection = "asc" | "desc";

export interface Subtask {
  id: number;
  taskId: number;
  checklistTitle: string | null;
  title: string;
  done: boolean;
  dueDate: string | null;
  wordCount: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: number;
  taskId: number;
  authorId: number;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskLabel {
  id: number;
  taskId: number;
  name: string;
  color: string;
  createdAt: string;
}

export interface TaskActivityUser {
  id: number;
  name: string | null;
}

export interface TaskActivity {
  id: number;
  taskId: number;
  userId: number;
  type: string;
  payload: string | null;
  createdAt: string;
  user: TaskActivityUser | null;
  /** Only filled by projectActivities, to group a project's history by task. */
  task?: { id: number; title: string } | null;
}

export interface Task {
  id: number;
  projectId: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
  wordCount: number | null;
  startDate: string | null;
  recurring: string | null;
  reminderOffset: string | null;
  sortOrder: number;
  /** Hex colour shown on the task's row in the project's Tasks list. */
  color?: string | null;
  totalTimeSeconds?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskAttachment {
  id: number;
  taskId: number;
  type: string;
  fileName: string | null;
  url: string;
  displayText: string | null;
  createdAt: string;
}

export interface TaskDetail extends Task {
  /** Words logged on this task's time entries. */
  totalWordsProcessed?: number | null;
  checklistTitles: string[];
  subtasks: Subtask[];
  comments: TaskComment[];
  labels: TaskLabel[];
  activities: TaskActivity[];
  attachments: TaskAttachment[];
}

export type TaskConnection = Connection<Task>;

export type CreateTaskInput = {
  projectId: number;
  title: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: string;
  wordCount?: number | null;
};

export type UpdateTaskInput = {
  id: number;
  title?: string;
  /** Empty clears it. */
  color?: string;
  description?: string;
  status?: TaskStatus;
  sortOrder?: number;
  dueDate?: string | null;
  startDate?: string | null;
  recurring?: string | null;
  reminderOffset?: string | null;
  projectId?: number;
  wordCount?: number | null;
};

export type CreateSubtaskInput = {
  taskId: number;
  checklistTitle?: string;
  title: string;
  dueDate?: string;
  wordCount?: number | null;
};

export type UpdateSubtaskInput = {
  id: number;
  checklistTitle?: string;
  title?: string;
  done?: boolean;
  dueDate?: string | null;
  wordCount?: number | null;
};

export interface TaskWordsFieldProps {
  id: string;
  value: number | null;
  onSave: (wordCount: number | null) => void;
}
