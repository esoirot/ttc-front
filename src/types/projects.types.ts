import type { ReactNode } from "react";
import type { Task, TaskSortField, TaskSortDirection } from "./tasks.types";
import type { Connection } from "./common.types";
import type { OccupationRef } from "./occupations.types";

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
  useCustomRate: boolean;
  rateSheetId: number | null;
  currency: string;
  deadline: string | null;
  startDate: string | null;
  totalTimeSeconds?: number | null;
  totalTaskWords?: number | null;
  occupations?: OccupationRef[];
  createdAt: string;
  updatedAt: string;
}

export type ProjectConnection = Connection<Project>;

export interface CreateProjectFormProps {
  onClose: () => void;
}

export interface OverviewTabProps {
  project: Project;
  totalSeconds: number;
}

export interface DistributionPieDatum {
  name: string;
  value: number;
}

export interface DistributionPieProps {
  title: string;
  subtitle?: string;
  data: DistributionPieDatum[];
  formatValue: (value: number) => string;
  emptyMessage?: string;
}

export interface TaskSortControlsProps {
  field: TaskSortField;
  direction: TaskSortDirection;
  onFieldChange: (field: TaskSortField) => void;
  onDirectionChange: (direction: TaskSortDirection) => void;
  idPrefix: string;
}

export interface TaskToolbarProps {
  idPrefix: string;
  dueFrom: string;
  dueTo: string;
  onDueFromChange: (date: string) => void;
  onDueToChange: (date: string) => void;
  sortField: TaskSortField;
  sortDirection: TaskSortDirection;
  onSortFieldChange: (field: TaskSortField) => void;
  onSortDirectionChange: (direction: TaskSortDirection) => void;
  onNewTask?: () => void;
  children?: ReactNode;
}

export interface ProjectCardProps {
  project: Project;
  clientName: string | undefined;
  onDelete: (id: number) => void;
  onClick: () => void;
}

export interface ProjectsOverviewChartsProps {
  /** Any date inside the month shown by the monthly charts. */
  month: Date;
}

export interface MonthSelectorProps {
  /** Any date inside the selected month. */
  month: Date;
  onChange: (month: Date) => void;
  /** Earliest selectable month (e.g. the month of the first logged entry). */
  min: Date;
  /** Latest selectable month; "next" is disabled once reached. */
  max: Date;
}

export interface ProjectHeaderProps {
  project: Project;
  onUpdate: (input: {
    id: number;
    clientId?: number | null;
    title?: string;
    description?: string | null;
    status?: ProjectStatus;
    sourceLanguage?: string | null;
    targetLanguage?: string | null;
    wordCount?: number | null;
    fixedFee?: number | null;
    hourlyRate?: number | null;
    perWordRate?: number | null;
    useCustomRate?: boolean;
    rateSheetId?: number | null;
    currency?: string;
    deadline?: string | null;
    startDate?: string | null;
    occupationIds?: number[];
  }) => Promise<unknown>;
  saving: boolean;
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
}

export interface SortableTaskProps {
  task: Task;
  onDelete: (id: number) => void;
  onOpenModal: (taskId: number) => void;
}

export interface ProjectActivityTabProps {
  projectId: number;
}

export interface TasksTabProps {
  projectId: number;
  tasks: Task[];
  tasksLoading: boolean;
  taskHasMore: boolean;
  taskLoadMore: () => void;
  onOpenModal: (taskId: number) => void;
}

export type ProjectInput = {
  title: string;
  description?: string | null;
  clientId?: number | null;
  status?: ProjectStatus;
  sourceLanguage?: string | null;
  targetLanguage?: string | null;
  wordCount?: number | null;
  unitPrice?: number;
  fixedFee?: number | null;
  hourlyRate?: number | null;
  perWordRate?: number | null;
  useCustomRate?: boolean;
  rateSheetId?: number | null;
  currency?: string;
  deadline?: string | null;
  startDate?: string | null;
  occupationIds?: number[];
};

export type ProjectsVars = {
  status?: ProjectStatus;
  search?: string;
  pagination?: { limit?: number; cursor?: number };
};

export type UpdateProjectInput = Partial<ProjectInput> & { id: number };
