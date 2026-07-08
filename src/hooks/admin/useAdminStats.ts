import { ADMIN_STATS_QUERY } from "../../graphql/admin.operations";
import { useGqlQuery } from "@/lib/gqlQuery";

export function useAdminStats() {
  const { data, isLoading } = useGqlQuery({
    queryKey: ["adminStats"],
    query: ADMIN_STATS_QUERY,
    select: (d) => d.adminStats,
  });
  return { stats: data ?? null, loading: isLoading };
}
