import { useQuery } from "@tanstack/react-query";
import {
  DASHBOARD_QUERY,
  type DashboardData,
} from "../../graphql/dashboard.operations";
import { gqlFetch } from "@/lib/apollo";

export function useDashboard(): {
  dashboard: DashboardData | null;
  loading: boolean;
} {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () =>
      gqlFetch<{ dashboard: DashboardData }>(DASHBOARD_QUERY).then(
        (d) => d.dashboard,
      ),
  });
  return { dashboard: data ?? null, loading: isLoading };
}
