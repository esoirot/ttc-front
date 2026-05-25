import type { Tag } from "./tags.types";

export interface TimeEntry {
  id: number;
  userId: number;
  projectId: number | null;
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

export interface TimeEntryConnection {
  items: TimeEntry[];
  nextCursor: number | null;
  total: number;
}

export type TtcUpdateInput = {
  id: number;
  description?: string;
  billable?: boolean;
  projectId?: number | null;
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
