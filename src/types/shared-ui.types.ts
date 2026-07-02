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
