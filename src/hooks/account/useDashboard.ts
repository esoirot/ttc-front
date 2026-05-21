import { useQuery } from "@apollo/client/react";
import {
  DASHBOARD_QUERY,
  type DashboardData,
} from "../../graphql/dashboard.operations";

export function useDashboard(): {
  dashboard: DashboardData | null;
  loading: boolean;
} {
  const { data, loading } = useQuery(DASHBOARD_QUERY);
  return { dashboard: data?.dashboard ?? null, loading };
}
