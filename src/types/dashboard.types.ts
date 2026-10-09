import type { ClientStatus } from "@/types/clients.types";

export type DeadlineKind = "PROJECT" | "TASK" | "CHECKLIST_ITEM";

/** Something with a due date: a project, a task or a checklist item. */
export interface DashboardDeadline {
  kind: DeadlineKind;
  id: number;
  title: string;
  deadline: string;
  projectId: number;
  projectTitle: string;
  taskId: number | null;
  taskTitle: string | null;
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
  /** Null when the prospect needs contacting now. */
  dueAt: string | null;
}

export interface DashboardData {
  activeProjectCount: number;
  monthToDateSeconds: number;
  monthToDateRevenue: number;
  yearToDateWords: number;
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
