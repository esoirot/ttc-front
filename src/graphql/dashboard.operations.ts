import { gql } from "@apollo/client/core";
import type { TypedDocumentNode } from "@apollo/client/core";

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

export interface DashboardData {
  activeProjectCount: number;
  unpaidInvoiceCount: number;
  monthToDateSeconds: number;
  monthToDateRevenue: number;
  upcomingDeadlines: DashboardDeadline[];
  recentTimeEntries: DashboardTimeEntry[];
}

export const DASHBOARD_QUERY: TypedDocumentNode<
  { dashboard: DashboardData },
  Record<string, never>
> = gql`
  query Dashboard {
    dashboard {
      activeProjectCount
      unpaidInvoiceCount
      monthToDateSeconds
      monthToDateRevenue
      upcomingDeadlines {
        id
        title
        deadline
        status
      }
      recentTimeEntries {
        id
        description
        startTime
        durationSeconds
      }
    }
  }
`;
