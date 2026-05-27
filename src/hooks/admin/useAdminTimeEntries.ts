import { useQuery, useMutation, useApolloClient } from "@apollo/client/react";
import {
  ADMIN_TIME_ENTRIES_QUERY,
  ADMIN_DELETE_TIME_ENTRY_MUTATION,
} from "../../graphql/admin.operations";

const LIMIT = 20;

export function useAdminTimeEntries(userId?: number) {
  const { data, loading, fetchMore } = useQuery(ADMIN_TIME_ENTRIES_QUERY, {
    variables: { userId, pagination: { limit: LIMIT } },
    fetchPolicy: "cache-and-network",
  });
  const conn = data?.adminTimeEntries;
  return {
    entries: conn?.items ?? [],
    loading,
    total: conn?.total ?? 0,
    hasMore: conn?.nextCursor !== null && conn?.nextCursor !== undefined,
    loadMore: () =>
      fetchMore({
        variables: {
          userId,
          pagination: { limit: LIMIT, cursor: conn?.nextCursor ?? undefined },
        },
        updateQuery: (prev, { fetchMoreResult }) => ({
          adminTimeEntries: {
            ...fetchMoreResult.adminTimeEntries,
            items: [
              ...prev.adminTimeEntries.items,
              ...fetchMoreResult.adminTimeEntries.items,
            ],
          },
        }),
      }),
  };
}

export function useAdminDeleteTimeEntry() {
  const client = useApolloClient();
  const [remove] = useMutation(ADMIN_DELETE_TIME_ENTRY_MUTATION, {
    onCompleted: () =>
      void client.refetchQueries({ include: [ADMIN_TIME_ENTRIES_QUERY] }),
  });
  return { deleteEntry: (id: number) => remove({ variables: { id } }) };
}
