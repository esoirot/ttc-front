import { useQueryClient } from "@tanstack/react-query";
import {
  ADMIN_TIME_ENTRIES_QUERY,
  ADMIN_DELETE_TIME_ENTRY_MUTATION,
} from "../../graphql/admin.operations";
import type { AdminTimeEntry } from "@/types/admin.types";
import { useGqlConnectionQuery } from "@/lib/gqlQuery";
import { useGqlMutation } from "@/lib/gqlMutation";
import { removeFromConnection } from "@/lib/cachePatch";

const LIMIT = 20;

export function useAdminTimeEntries(userId?: number) {
  const { items, total, hasMore, loadMore, loading } = useGqlConnectionQuery({
    queryKey: ["adminTimeEntries", { userId: userId ?? null }],
    query: ADMIN_TIME_ENTRIES_QUERY,
    variables: { userId },
    select: (d) => d.adminTimeEntries,
    limit: LIMIT,
  });

  return {
    entries: items,
    loading,
    total,
    hasMore,
    loadMore,
  };
}

export function useAdminDeleteTimeEntry() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useGqlMutation({
    mutation: ADMIN_DELETE_TIME_ENTRY_MUTATION,
    unwrap: (d) => d.adminDeleteTimeEntry,
    onSuccess: (_data, { id }) => {
      removeFromConnection(
        queryClient,
        ["adminTimeEntries"],
        id,
        (e: AdminTimeEntry) => e.id,
      );
    },
  });
  return { deleteEntry: (id: number) => mutateAsync({ id }) };
}
