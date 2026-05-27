import { useQuery, useMutation, useApolloClient } from "@apollo/client/react";
import {
  ADMIN_CLIENTS_QUERY,
  ADMIN_CREATE_CLIENT_MUTATION,
  ADMIN_UPDATE_CLIENT_MUTATION,
  ADMIN_DELETE_CLIENT_MUTATION,
} from "../../graphql/admin.operations";

const LIMIT = 20;

export function useAdminClients(search?: string) {
  const client = useApolloClient();
  const { data, loading, fetchMore } = useQuery(ADMIN_CLIENTS_QUERY, {
    variables: { search, pagination: { limit: LIMIT } },
    fetchPolicy: "cache-and-network",
  });
  const conn = data?.adminClients;
  return {
    clients: conn?.items ?? [],
    loading,
    total: conn?.total ?? 0,
    hasMore: conn?.nextCursor !== null && conn?.nextCursor !== undefined,
    loadMore: () =>
      fetchMore({
        variables: {
          search,
          pagination: { limit: LIMIT, cursor: conn?.nextCursor ?? undefined },
        },
        updateQuery: (prev, { fetchMoreResult }) => ({
          adminClients: {
            ...fetchMoreResult.adminClients,
            items: [
              ...prev.adminClients.items,
              ...fetchMoreResult.adminClients.items,
            ],
          },
        }),
      }),
    refetch: () => client.refetchQueries({ include: [ADMIN_CLIENTS_QUERY] }),
  };
}

export function useAdminCrudClients() {
  const client = useApolloClient();
  const refetch = () =>
    client.refetchQueries({ include: [ADMIN_CLIENTS_QUERY] });

  const [create] = useMutation(ADMIN_CREATE_CLIENT_MUTATION, {
    onCompleted: () => void refetch(),
  });
  const [update] = useMutation(ADMIN_UPDATE_CLIENT_MUTATION, {
    onCompleted: () => void refetch(),
  });
  const [remove] = useMutation(ADMIN_DELETE_CLIENT_MUTATION, {
    onCompleted: () => void refetch(),
  });

  return {
    createClient: (input: Parameters<typeof create>[0]["variables"]["input"]) =>
      create({ variables: { input } }),
    updateClient: (input: Parameters<typeof update>[0]["variables"]["input"]) =>
      update({ variables: { input } }),
    deleteClient: (id: number) => remove({ variables: { id } }),
  };
}
