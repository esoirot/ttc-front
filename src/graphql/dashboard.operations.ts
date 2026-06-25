import { gql } from "@apollo/client/core";
import type { TypedDocumentNode } from "@apollo/client/core";
import type {
  DashboardDeadline,
  DashboardTimeEntry,
  DashboardProspect,
  DashboardData,
} from "@/types/dashboard.types";

export type {
  DashboardDeadline,
  DashboardTimeEntry,
  DashboardProspect,
  DashboardData,
};

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
      prospectsToContact {
        id
        name
        status
        contactedAt
      }
    }
  }
`;
