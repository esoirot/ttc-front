import { useQuery, useMutation } from "@apollo/client/react";
import {
  CLIENTS_QUERY,
  CLIENT_QUERY,
  CREATE_CLIENT_MUTATION,
  UPDATE_CLIENT_MUTATION,
  DELETE_CLIENT_MUTATION,
  CREATE_COMPANY_CONTACT_MUTATION,
  UPDATE_COMPANY_CONTACT_MUTATION,
  DELETE_COMPANY_CONTACT_MUTATION,
  type Client,
  type ClientConnection,
  type CompanyContact,
} from "../../graphql/clients.operations";

export type { Client, ClientConnection, CompanyContact };

export function useClients(search?: string) {
  const baseVars = {
    ...(search ? { search } : {}),
    pagination: { limit: 20 },
  };

  const { data, fetchMore, loading, error } = useQuery(CLIENTS_QUERY, {
    variables: baseVars,
  });

  const nextCursor = data?.clients.nextCursor ?? null;

  function loadMore() {
    void fetchMore({
      variables: {
        ...baseVars,
        pagination: { limit: 20, cursor: nextCursor ?? undefined },
      },
      updateQuery(prev, { fetchMoreResult }) {
        if (!fetchMoreResult) return prev;
        return {
          clients: {
            ...fetchMoreResult.clients,
            items: [...prev.clients.items, ...fetchMoreResult.clients.items],
          },
        };
      },
    });
  }

  return {
    clients: data?.clients.items ?? [],
    total: data?.clients.total ?? 0,
    hasMore: nextCursor !== null,
    loadMore,
    loading,
    error,
  };
}

export function useClient(id: number) {
  const { data, loading, error } = useQuery(CLIENT_QUERY, {
    variables: { id },
  });
  return { client: data?.client ?? null, loading, error };
}

export function useCreateClient() {
  const [mutate, { loading, error }] = useMutation(CREATE_CLIENT_MUTATION, {
    refetchQueries: [
      { query: CLIENTS_QUERY, variables: { pagination: { limit: 20 } } },
    ],
  });
  return {
    createClient: (input: Parameters<typeof mutate>[0]["variables"]["input"]) =>
      mutate({ variables: { input } }),
    loading,
    error,
  };
}

export function useUpdateClient() {
  const [mutate, { loading, error }] = useMutation(UPDATE_CLIENT_MUTATION, {
    refetchQueries: [
      { query: CLIENTS_QUERY, variables: { pagination: { limit: 20 } } },
    ],
  });
  return {
    updateClient: (input: Parameters<typeof mutate>[0]["variables"]["input"]) =>
      mutate({ variables: { input } }),
    loading,
    error,
  };
}

export function useDeleteClient() {
  const [mutate, { loading, error }] = useMutation(DELETE_CLIENT_MUTATION, {
    refetchQueries: [
      { query: CLIENTS_QUERY, variables: { pagination: { limit: 20 } } },
    ],
  });
  return {
    deleteClient: (id: number) => mutate({ variables: { id } }),
    loading,
    error,
  };
}

export function useCreateCompanyContact(clientId: number) {
  const [mutate, { loading, error }] = useMutation(
    CREATE_COMPANY_CONTACT_MUTATION,
    { refetchQueries: [{ query: CLIENT_QUERY, variables: { id: clientId } }] },
  );
  return {
    createContact: (
      input: Omit<
        Parameters<typeof mutate>[0]["variables"]["input"],
        "clientId"
      >,
    ) => mutate({ variables: { input: { ...input, clientId } } }),
    loading,
    error,
  };
}

export function useUpdateCompanyContact(clientId: number) {
  const [mutate, { loading, error }] = useMutation(
    UPDATE_COMPANY_CONTACT_MUTATION,
    { refetchQueries: [{ query: CLIENT_QUERY, variables: { id: clientId } }] },
  );
  return {
    updateContact: (
      input: Parameters<typeof mutate>[0]["variables"]["input"],
    ) => mutate({ variables: { input } }),
    loading,
    error,
  };
}

export function useDeleteCompanyContact(clientId: number) {
  const [mutate, { loading, error }] = useMutation(
    DELETE_COMPANY_CONTACT_MUTATION,
    { refetchQueries: [{ query: CLIENT_QUERY, variables: { id: clientId } }] },
  );
  return {
    deleteContact: (id: number) => mutate({ variables: { id } }),
    loading,
    error,
  };
}
