import type { Client } from "./clients.types";
import type { Task, TaskStatus } from "./tasks.types";
import type { TimeEntry, TtcUpdateInput } from "./time-entries.types";
import type { Member } from "./users.types";
import type { Tag } from "./tags.types";

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
  createdAt: string;
  updatedAt: string;
}

export interface ProjectConnection {
  items: Project[];
  nextCursor: number | null;
  total: number;
}

export interface CreateProjectFormProps {
  clients: Client[];
  onClose: () => void;
}

export interface OverviewTabProps {
  project: Project;
  totalSeconds: number;
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
  onStatusChange: (id: number, status: TaskStatus) => void;
  onDelete: (id: number) => void;
  onOpenModal: (taskId: number) => void;
  memberMap: Record<number, string>;
  members: Member[];
}

export interface TasksTabProps {
  projectId: number;
  tasks: Task[];
  tasksLoading: boolean;
  taskHasMore: boolean;
  taskLoadMore: () => void;
  members: Member[];
  memberMap: Record<number, string>;
  onOpenModal: (taskId: number) => void;
}

export interface TimeTabProps {
  projectId: number;
  entries: TimeEntry[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => void;
  activeTimer: TimeEntry | null | undefined;
  stopTimer: () => Promise<unknown>;
  stopping: boolean;
  deleteTimeEntry: (id: number) => Promise<unknown>;
  updateTimeEntry: (input: TtcUpdateInput) => void;
  projects: Project[];
  tags: Tag[];
  recentDescriptions: string[];
  handleResume: (entry: TimeEntry) => void;
}
