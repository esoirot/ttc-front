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
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDetail extends Task {
  subtasks: Subtask[];
  comments: TaskComment[];
  labels: TaskLabel[];
  activities: TaskActivity[];
}

export interface TaskConnection {
  items: Task[];
  nextCursor: number | null;
  total: number;
}
