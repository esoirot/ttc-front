import {
  DASHBOARD_QUERY,
  type DashboardData,
} from "../../graphql/dashboard.operations";
import { useGqlQuery } from "@/lib/gqlQuery";

export function useDashboard(): {
  dashboard: DashboardData | null;
  loading: boolean;
} {
  const { data, isLoading } = useGqlQuery({
    queryKey: ["dashboard"],
    query: DASHBOARD_QUERY,
    select: (d) => d.dashboard,
  });
  return { dashboard: data ?? null, loading: isLoading };
}
