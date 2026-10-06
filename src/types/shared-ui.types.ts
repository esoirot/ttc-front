import type { TimeEntry, TtcUpdateInput } from "./time-entries.types";
import type { Project } from "./projects.types";
import type { Tag } from "./tags.types";
import type { Client } from "./clients.types";

export type TimerStartInputProps = {
  projects: Project[];
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
  clients: Client[];
  onClose: () => void;
  onCreated: (id: number) => void;
};

export type GenerateInvoiceFormProps = {
  clients: Client[];
  projects: Project[];
  onClose: () => void;
  onGenerated: (id: number) => void;
};

export interface KpiGridProps {
  children: React.ReactNode;
  className?: string;
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
