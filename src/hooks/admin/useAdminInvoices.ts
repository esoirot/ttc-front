import { useQuery, useMutation, useApolloClient } from "@apollo/client/react";
import type { InvoiceStatus } from "@/types/invoices.types";
import {
  ADMIN_INVOICES_QUERY,
  ADMIN_UPDATE_INVOICE_MUTATION,
  ADMIN_DELETE_INVOICE_MUTATION,
} from "../../graphql/admin.operations";

const LIMIT = 20;

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
          pagination: { limit: LIMIT, cursor: conn?.nextCursor ?? undefined },
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
