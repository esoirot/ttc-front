import { useQuery, useMutation, useApolloClient } from "@apollo/client/react";
import type { ProjectStatus } from "../../graphql/projects.operations";
import type { InvoiceStatus } from "../../graphql/invoices.operations";
import type { RateType } from "../../graphql/rates.operations";
import {
  ADMIN_STATS_QUERY,
  ADMIN_CLIENTS_QUERY,
  ADMIN_PROJECTS_QUERY,
  ADMIN_INVOICES_QUERY,
  ADMIN_TIME_ENTRIES_QUERY,
  ADMIN_RATES_QUERY,
  ADMIN_CREATE_CLIENT_MUTATION,
  ADMIN_UPDATE_CLIENT_MUTATION,
  ADMIN_DELETE_CLIENT_MUTATION,
  ADMIN_CREATE_PROJECT_MUTATION,
  ADMIN_UPDATE_PROJECT_MUTATION,
  ADMIN_DELETE_PROJECT_MUTATION,
  ADMIN_UPDATE_INVOICE_MUTATION,
  ADMIN_DELETE_INVOICE_MUTATION,
  ADMIN_DELETE_TIME_ENTRY_MUTATION,
  ADMIN_CREATE_RATE_MUTATION,
  ADMIN_UPDATE_RATE_MUTATION,
  ADMIN_DELETE_RATE_MUTATION,
} from "../../graphql/admin.operations";

const LIMIT = 20;

// ── Stats ────────────────────────────────────────────────────────────────────

export function useAdminStats() {
  const { data, loading } = useQuery(ADMIN_STATS_QUERY, {
    fetchPolicy: "cache-and-network",
  });
  return { stats: data?.adminStats ?? null, loading };
}

// ── Clients ──────────────────────────────────────────────────────────────────

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
          pagination: { limit: LIMIT, cursor: conn?.nextCursor },
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

// ── Projects ─────────────────────────────────────────────────────────────────

export function useAdminProjects(status?: ProjectStatus, search?: string) {
  const { data, loading, fetchMore } = useQuery(ADMIN_PROJECTS_QUERY, {
    variables: { status, search, pagination: { limit: LIMIT } },
    fetchPolicy: "cache-and-network",
  });
  const conn = data?.adminProjects;
  return {
    projects: conn?.items ?? [],
    loading,
    total: conn?.total ?? 0,
    hasMore: conn?.nextCursor !== null && conn?.nextCursor !== undefined,
    loadMore: () =>
      fetchMore({
        variables: {
          status,
          search,
          pagination: { limit: LIMIT, cursor: conn?.nextCursor },
        },
        updateQuery: (prev, { fetchMoreResult }) => ({
          adminProjects: {
            ...fetchMoreResult.adminProjects,
            items: [
              ...prev.adminProjects.items,
              ...fetchMoreResult.adminProjects.items,
            ],
          },
        }),
      }),
  };
}

export function useAdminCrudProjects() {
  const client = useApolloClient();
  const refetch = () =>
    client.refetchQueries({ include: [ADMIN_PROJECTS_QUERY] });

  const [create] = useMutation(ADMIN_CREATE_PROJECT_MUTATION, {
    onCompleted: () => void refetch(),
  });
  const [update] = useMutation(ADMIN_UPDATE_PROJECT_MUTATION, {
    onCompleted: () => void refetch(),
  });
  const [remove] = useMutation(ADMIN_DELETE_PROJECT_MUTATION, {
    onCompleted: () => void refetch(),
  });

  return {
    createProject: (
      input: Parameters<typeof create>[0]["variables"]["input"],
    ) => create({ variables: { input } }),
    updateProject: (
      input: Parameters<typeof update>[0]["variables"]["input"],
    ) => update({ variables: { input } }),
    deleteProject: (id: number) => remove({ variables: { id } }),
  };
}

// ── Invoices ─────────────────────────────────────────────────────────────────

export function useAdminInvoices(status?: InvoiceStatus, search?: string) {
  const { data, loading, fetchMore } = useQuery(ADMIN_INVOICES_QUERY, {
    variables: { status, search, pagination: { limit: LIMIT } },
    fetchPolicy: "cache-and-network",
  });
  const conn = data?.adminInvoices;
  return {
    invoices: conn?.items ?? [],
    loading,
    total: conn?.total ?? 0,
    hasMore: conn?.nextCursor !== null && conn?.nextCursor !== undefined,
    loadMore: () =>
      fetchMore({
        variables: {
          status,
          search,
          pagination: { limit: LIMIT, cursor: conn?.nextCursor },
        },
        updateQuery: (prev, { fetchMoreResult }) => ({
          adminInvoices: {
            ...fetchMoreResult.adminInvoices,
            items: [
              ...prev.adminInvoices.items,
              ...fetchMoreResult.adminInvoices.items,
            ],
          },
        }),
      }),
  };
}

export function useAdminCrudInvoices() {
  const client = useApolloClient();
  const refetch = () =>
    client.refetchQueries({ include: [ADMIN_INVOICES_QUERY] });

  const [update] = useMutation(ADMIN_UPDATE_INVOICE_MUTATION, {
    onCompleted: () => void refetch(),
  });
  const [remove] = useMutation(ADMIN_DELETE_INVOICE_MUTATION, {
    onCompleted: () => void refetch(),
  });

  return {
    updateInvoice: (
      input: Parameters<typeof update>[0]["variables"]["input"],
    ) => update({ variables: { input } }),
    deleteInvoice: (id: number) => remove({ variables: { id } }),
  };
}

// ── Time Entries ─────────────────────────────────────────────────────────────

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
          pagination: { limit: LIMIT, cursor: conn?.nextCursor },
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

// ── Rates ────────────────────────────────────────────────────────────────────

export function useAdminRates(type?: RateType) {
  const { data, loading } = useQuery(ADMIN_RATES_QUERY, {
    variables: { type },
    fetchPolicy: "cache-and-network",
  });
  const conn = data?.adminRates;
  return {
    rates: conn?.items ?? [],
    loading,
    total: conn?.total ?? 0,
  };
}

export function useAdminCrudRates() {
  const client = useApolloClient();
  const refetch = () => client.refetchQueries({ include: [ADMIN_RATES_QUERY] });

  const [create] = useMutation(ADMIN_CREATE_RATE_MUTATION, {
    onCompleted: () => void refetch(),
  });
  const [update] = useMutation(ADMIN_UPDATE_RATE_MUTATION, {
    onCompleted: () => void refetch(),
  });
  const [remove] = useMutation(ADMIN_DELETE_RATE_MUTATION, {
    onCompleted: () => void refetch(),
  });

  return {
    createRate: (input: Parameters<typeof create>[0]["variables"]["input"]) =>
      create({ variables: { input } }),
    updateRate: (input: Parameters<typeof update>[0]["variables"]["input"]) =>
      update({ variables: { input } }),
    deleteRate: (id: number) => remove({ variables: { id } }),
  };
}
