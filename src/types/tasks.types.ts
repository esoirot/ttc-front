export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface Subtask {
  id: number;
  taskId: number;
  title: string;
  done: boolean;
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

export interface Task {
  id: number;
  projectId: number;
  assigneeId: number | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDetail extends Task {
  subtasks: Subtask[];
  comments: TaskComment[];
}

export interface TaskConnection {
  items: Task[];
  nextCursor: number | null;
  total: number;
}
