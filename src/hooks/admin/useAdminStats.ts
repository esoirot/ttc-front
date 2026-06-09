import { useQuery } from "@tanstack/react-query";
import { ADMIN_STATS_QUERY } from "../../graphql/admin.operations";
import type { AdminStats } from "@/types/admin.types";
import { gqlFetch } from "@/lib/apollo";

export function useAdminStats() {
  const { data, isLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: () =>
      gqlFetch<{ adminStats: AdminStats }>(ADMIN_STATS_QUERY).then(
        (d) => d.adminStats,
      ),
  });
  return { stats: data ?? null, loading: isLoading };
}
