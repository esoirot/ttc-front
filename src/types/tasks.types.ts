import type { Connection } from "./common.types";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface Subtask {
  id: number;
  taskId: number;
  checklistTitle: string | null;
  title: string;
  done: boolean;
  dueDate: string | null;
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
}

export interface Task {
  id: number;
  projectId: number;
  assigneeId: number | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
  startDate: string | null;
  recurring: string | null;
  reminderOffset: string | null;
  sortOrder: number;
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
  assigneeId?: number;
  status?: TaskStatus;
  dueDate?: string;
};

export type UpdateTaskInput = {
  id: number;
  title?: string;
  description?: string;
  status?: TaskStatus;
  sortOrder?: number;
  dueDate?: string | null;
  startDate?: string | null;
  recurring?: string | null;
  reminderOffset?: string | null;
  assigneeId?: number;
  projectId?: number;
};

export type CreateSubtaskInput = {
  taskId: number;
  checklistTitle?: string;
  title: string;
  dueDate?: string;
};

export type UpdateSubtaskInput = {
  id: number;
  checklistTitle?: string;
  title?: string;
  done?: boolean;
  dueDate?: string | null;
};
