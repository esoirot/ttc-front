import type { Client } from "./clients.types";
import type { Project } from "./projects.types";
import type { Invoice } from "./invoices.types";
import type { TimeEntry } from "./time-entries.types";
import type { Rate } from "./rates.types";
import type { AdminPermission } from "./users.types";

export type { AdminPermission };

export interface AdminOwner {
  id: number;
  email: string;
  name: string | null;
}

export interface AdminStats {
  totalUsers: number;
  totalClients: number;
  totalProjects: number;
  totalInvoices: number;
  totalRevenue: number;
  totalTimeSeconds: number;
}

export interface AdminClient extends Client {
  owner: AdminOwner;
}

export interface AdminProject extends Project {
  owner: AdminOwner;
}

export interface AdminInvoice extends Invoice {
  owner: AdminOwner;
}

export interface AdminTimeEntry extends TimeEntry {
  owner: AdminOwner;
}

export interface AdminRate extends Rate {
  owner: AdminOwner;
}

export interface AdminConnection<T> {
  items: T[];
  nextCursor: number | null;
  total: number;
}

export interface ResourceAuditHistoryProps {
  open: boolean;
  onClose: () => void;
  resourceName: string;
}
