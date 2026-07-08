import type { Tag } from "./tags.types";
import type { Connection } from "./common.types";

export interface TimeEntry {
  id: number;
  userId: number;
  projectId: number | null;
  taskId?: number | null;
  task?: { id: number; title: string } | null;
  subtaskId?: number | null;
  subtask?: { id: number; title: string; checklistTitle: string | null } | null;
  description: string | null;
  startTime: string;
  endTime: string | null;
  durationSeconds: number | null;
  billable: boolean;
  clockifyEntryId: string | null;
  tags: { id: number; name: string }[];
  createdAt: string;
  updatedAt: string;
}

export type TimeEntryConnection = Connection<TimeEntry>;

export type TtcUpdateInput = {
  id: number;
  description?: string;
  billable?: boolean;
  projectId?: number | null;
  taskId?: number | null;
  subtaskId?: number | null;
  tagIds?: number[];
};

export interface ActiveTimerBannerProps {
  activeTimer: TimeEntry;
  stopTimer: () => Promise<unknown>;
  stopping: boolean;
  refetch: () => void;
}

export interface ClockifyImportFormProps {
  workspaceId: string;
  refetch: () => void;
  onClose: () => void;
}

export interface DateRangeFilterProps {
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  count: number;
  total: number;
  totalSeconds: number;
}

export type DescriptionComboboxProps = {
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  recentDescriptions: string[];
  placeholder?: string;
  className?: string;
};

export interface ManualEntryFormProps {
  onClose: () => void;
  recentDescriptions: string[];
  tags: Tag[];
}

export type TtcTagChipsProps = {
  tagIds: number[];
  tags: Tag[];
  onAdd: (id: number) => void;
  onRemove: (id: number) => void;
};

export type TimeEntryFilters = {
  projectId?: number;
  projectIds?: number[];
  taskId?: number;
  start?: string;
  end?: string;
};

export type UpdateTimeEntryInput = {
  id: number;
  projectId?: number | null;
  taskId?: number | null;
  subtaskId?: number | null;
  description?: string;
  startTime?: string;
  endTime?: string;
  billable?: boolean;
  tagIds?: number[];
};
