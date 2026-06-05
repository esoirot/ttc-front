import { useQuery } from "@tanstack/react-query";
import {
  DASHBOARD_QUERY,
  type DashboardData,
} from "../../graphql/dashboard.operations";
import { gqlRequest } from "@/lib/api";

export function useDashboard(): {
  dashboard: DashboardData | null;
  loading: boolean;
} {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () =>
      gqlRequest<{ dashboard: DashboardData }>(DASHBOARD_QUERY).then(
        (d) => d.dashboard,
      ),
  });
  return { dashboard: data ?? null, loading: isLoading };
}
