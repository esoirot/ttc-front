import type { TimeEntry, TtcUpdateInput } from "./time-entries.types";
import type { Project } from "./projects.types";
import type { Tag } from "./tags.types";

export type TimerStartInputProps = {
  tags: Tag[];
  recentDescriptions: string[];
  initialProjectId?: number | null;
  initialTaskId?: number | null;
  initialTaskTitle?: string | null;
};

export interface TimerSectionProps extends TimerStartInputProps {
  activeTimer: TimeEntry | null | undefined;
  stopTimer: () => Promise<unknown>;
  stopping: boolean;
  refetch: () => void;
}

export interface EntryListProps {
  entries: TimeEntry[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  deleteTimeEntry: (id: number) => Promise<unknown>;
  projects: Project[];
  tags: Tag[];
  onResume: (entry: TimeEntry) => void;
  onUpdate: (input: TtcUpdateInput) => void;
}

export interface TimeTabProps {
  list: EntryListProps;
  timer: TimerSectionProps;
}

export type CreateInvoiceFormProps = {
  onClose: () => void;
  onCreated: (id: number) => void;
};

export type GenerateInvoiceFormProps = {
  onClose: () => void;
  onGenerated: (id: number) => void;
};

export interface KpiGridProps {
  children: React.ReactNode;
  className?: string;
}

export interface SearchSelectOption {
  value: string;
  label: string;
}

export interface SearchSelectProps {
  /** Selected option value; "" when nothing is selected. */
  value: string;
  /** Name of the selection when it is not among the loaded options. */
  selectedLabel?: string;
  options: SearchSelectOption[];
  search: string;
  onSearchChange: (search: string) => void;
  /** Called with ("", null) when the selection is cleared. */
  onChange: (value: string, label: string | null) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeholder: string;
  /** Adds a first option that clears the selection. */
  noneLabel?: string;
  loading?: boolean;
  id?: string;
  className?: string;
  "aria-label"?: string;
}

/** Props shared by the client, project and task pickers. */
export interface EntityPickerProps {
  value: string;
  onChange: (value: string, label: string | null) => void;
  placeholder: string;
  noneLabel?: string;
  id?: string;
  className?: string;
  "aria-label"?: string;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface TaskPickerProps extends EntityPickerProps {
  projectId: number;
}

export interface CompactNumberProps {
  value: number;
  /** Decimals shown below one million (and in the full value on hover). */
  fractionDigits?: number;
}

export interface KpiCardProps {
  label: React.ReactNode;
  value?: React.ReactNode;
  unit?: React.ReactNode;
  /** Monospace digits, for durations and counts that should not jitter. */
  mono?: boolean;
  /** Makes the whole card a link to this route. */
  to?: string;
  /** Rich content shown instead of value/unit (e.g. several lines). */
  children?: React.ReactNode;
}
