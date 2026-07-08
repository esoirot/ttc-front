import type { Client } from "./clients.types";
import type { Task, TaskStatus } from "./tasks.types";
import type { Member } from "./users.types";
import type { Connection } from "./common.types";

export type ProjectStatus =
  | "DRAFT"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "ARCHIVED"
  | "INVOICE_SENT"
  | "INVOICE_PAID";

export interface Project {
  id: number;
  userId: number | null;
  clientId: number | null;
  title: string;
  description: string | null;
  status: ProjectStatus;
  sourceLanguage: string | null;
  targetLanguage: string | null;
  wordCount: number | null;
  unitPrice: number | null;
  fixedFee: number | null;
  hourlyRate: number | null;
  perWordRate: number | null;
  currency: string;
  deadline: string | null;
  startDate: string | null;
  totalTimeSeconds?: number | null;
  createdAt: string;
  updatedAt: string;
}

export type ProjectConnection = Connection<Project>;

export interface CreateProjectFormProps {
  clients: Client[];
  onClose: () => void;
}

export interface OverviewTabProps {
  project: Project;
  totalSeconds: number;
  tasks: import("./tasks.types").Task[];
}

export interface ProjectCardProps {
  project: Project;
  clientName: string | undefined;
  onDelete: (id: number) => void;
  onClick: () => void;
}

export interface ProjectHeaderProps {
  project: Project;
  clients: Client[];
  onUpdate: (input: {
    id: number;
    clientId?: number | null;
    title?: string;
    description?: string;
    status?: ProjectStatus;
    sourceLanguage?: string;
    targetLanguage?: string;
    wordCount?: number;
    fixedFee?: number | null;
    hourlyRate?: number | null;
    perWordRate?: number | null;
    currency?: string;
    deadline?: string;
    startDate?: string;
  }) => Promise<unknown>;
  saving: boolean;
}

export interface TaskEditForm {
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
  assigneeId: string;
}

export interface SortableRowProps {
  task: Task;
  selected: boolean;
  onSelect: (id: number, checked: boolean) => void;
  onOpenModal: (taskId: number) => void;
  onDelete: (id: number) => void;
}

export interface ProjectTaskListProps {
  projectId: number;
  members: Member[];
}

export interface SortableTaskProps {
  task: Task;
  onDelete: (id: number) => void;
  onOpenModal: (taskId: number) => void;
  memberMap: Record<number, string>;
}

export interface TasksTabProps {
  projectId: number;
  tasks: Task[];
  tasksLoading: boolean;
  taskHasMore: boolean;
  taskLoadMore: () => void;
  memberMap: Record<number, string>;
  onOpenModal: (taskId: number) => void;
}

export type ProjectInput = {
  title: string;
  description?: string;
  clientId?: number | null;
  status?: ProjectStatus;
  sourceLanguage?: string;
  targetLanguage?: string;
  wordCount?: number;
  unitPrice?: number;
  fixedFee?: number | null;
  hourlyRate?: number | null;
  perWordRate?: number | null;
  currency?: string;
  deadline?: string;
  startDate?: string;
};

export type ProjectsVars = {
  status?: ProjectStatus;
  search?: string;
  pagination?: { limit?: number; cursor?: number };
};

export type UpdateProjectInput = Partial<ProjectInput> & { id: number };
