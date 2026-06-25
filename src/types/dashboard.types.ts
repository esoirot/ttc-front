import type { ClientStatus } from "@/types/clients.types";

export interface DashboardDeadline {
  id: number;
  title: string;
  deadline: string;
  status: string;
}

export interface DashboardTimeEntry {
  id: number;
  description: string | null;
  startTime: string;
  durationSeconds: number | null;
}

export interface DashboardProspect {
  id: number;
  name: string;
  status: ClientStatus;
  contactedAt: string | null;
}

export interface DashboardData {
  activeProjectCount: number;
  unpaidInvoiceCount: number;
  monthToDateSeconds: number;
  monthToDateRevenue: number;
  upcomingDeadlines: DashboardDeadline[];
  recentTimeEntries: DashboardTimeEntry[];
  prospectsToContact: DashboardProspect[];
}

export interface RecentTimeEntriesProps {
  entries: DashboardTimeEntry[];
}

export interface StatsGridProps {
  dashboard: DashboardData;
}

export interface UpcomingDeadlinesProps {
  deadlines: DashboardDeadline[];
}

export interface ProspectsToContactProps {
  prospects: DashboardProspect[];
}
