import { useQuery } from "@apollo/client/react";
import { ADMIN_STATS_QUERY } from "../../graphql/admin.operations";

export function useAdminStats() {
  const { data, loading } = useQuery(ADMIN_STATS_QUERY, {
    fetchPolicy: "cache-and-network",
  });
  return { stats: data?.adminStats ?? null, loading };
}
