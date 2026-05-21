import { useQuery, useMutation } from "@apollo/client/react";
import {
  INVOICES_QUERY,
  INVOICE_QUERY,
  CREATE_INVOICE_MUTATION,
  GENERATE_INVOICE_MUTATION,
  UPDATE_INVOICE_MUTATION,
  DELETE_INVOICE_MUTATION,
  ADD_INVOICE_ITEM_MUTATION,
  UPDATE_INVOICE_ITEM_MUTATION,
  REMOVE_INVOICE_ITEM_MUTATION,
  type Invoice,
  type InvoiceItem,
  type InvoiceStatus,
  type InvoiceConnection,
} from "../../graphql/invoices.operations";

export type { Invoice, InvoiceItem, InvoiceStatus, InvoiceConnection };

const LIMIT = 20;
const FIRST_PAGE = { limit: LIMIT };

export function useInvoices(
  status?: InvoiceStatus,
  clientId?: number,
  search?: string,
) {
  const baseVars = {
    ...(status ? { status } : {}),
    ...(clientId !== undefined ? { clientId } : {}),
    ...(search ? { search } : {}),
    pagination: FIRST_PAGE,
  };

  const { data, fetchMore, loading, error } = useQuery(INVOICES_QUERY, {
    variables: baseVars,
  });

  const nextCursor = data?.invoices.nextCursor ?? null;

  function loadMore() {
    void fetchMore({
      variables: {
        ...baseVars,
        pagination: { limit: LIMIT, cursor: nextCursor ?? undefined },
      },
      updateQuery(prev, { fetchMoreResult }) {
        if (!fetchMoreResult) return prev;
        return {
          invoices: {
            ...fetchMoreResult.invoices,
            items: [...prev.invoices.items, ...fetchMoreResult.invoices.items],
          },
        };
      },
    });
  }

  return {
    invoices: data?.invoices.items ?? [],
    total: data?.invoices.total ?? 0,
    hasMore: nextCursor !== null,
    loadMore,
    loading,
    error,
  };
}

export function useInvoice(id: number) {
  const { data, loading, error } = useQuery(INVOICE_QUERY, {
    variables: { id },
  });
  return { invoice: data?.invoice ?? null, loading, error };
}

export function useCreateInvoice() {
  const [mutate, { loading, error }] = useMutation(CREATE_INVOICE_MUTATION, {
    refetchQueries: [
      { query: INVOICES_QUERY, variables: { pagination: FIRST_PAGE } },
    ],
  });
  return {
    createInvoice: (
      input: Parameters<typeof mutate>[0]["variables"]["input"],
    ) => mutate({ variables: { input } }),
    loading,
    error,
  };
}

export function useGenerateInvoice() {
  const [mutate, { loading, error }] = useMutation(GENERATE_INVOICE_MUTATION, {
    refetchQueries: [
      { query: INVOICES_QUERY, variables: { pagination: FIRST_PAGE } },
    ],
  });
  return {
    generateInvoice: (
      input: Parameters<typeof mutate>[0]["variables"]["input"],
    ) => mutate({ variables: { input } }),
    loading,
    error,
  };
}

export function useUpdateInvoice(id: number) {
  const [mutate, { loading, error }] = useMutation(UPDATE_INVOICE_MUTATION, {
    refetchQueries: [
      { query: INVOICES_QUERY, variables: { pagination: FIRST_PAGE } },
      { query: INVOICE_QUERY, variables: { id } },
    ],
  });
  return {
    updateInvoice: (
      input: Parameters<typeof mutate>[0]["variables"]["input"],
    ) => mutate({ variables: { input } }),
    loading,
    error,
  };
}

export function useDeleteInvoice() {
  const [mutate, { loading, error }] = useMutation(DELETE_INVOICE_MUTATION, {
    refetchQueries: [
      { query: INVOICES_QUERY, variables: { pagination: FIRST_PAGE } },
    ],
  });
  return {
    deleteInvoice: (id: number) => mutate({ variables: { id } }),
    loading,
    error,
  };
}

export function useAddInvoiceItem(invoiceId: number) {
  const [mutate, { loading, error }] = useMutation(ADD_INVOICE_ITEM_MUTATION, {
    refetchQueries: [{ query: INVOICE_QUERY, variables: { id: invoiceId } }],
  });
  return {
    addItem: (input: Parameters<typeof mutate>[0]["variables"]["input"]) =>
      mutate({ variables: { input } }),
    loading,
    error,
  };
}

export function useUpdateInvoiceItem(invoiceId: number) {
  const [mutate] = useMutation(UPDATE_INVOICE_ITEM_MUTATION, {
    refetchQueries: [{ query: INVOICE_QUERY, variables: { id: invoiceId } }],
  });
  return {
    updateItem: (input: {
      id: number;
      description?: string;
      quantity?: number;
      unitPrice?: number;
    }) => mutate({ variables: { input } }),
  };
}

export function useRemoveInvoiceItem(invoiceId: number) {
  const [mutate, { loading, error }] = useMutation(
    REMOVE_INVOICE_ITEM_MUTATION,
    {
      refetchQueries: [{ query: INVOICE_QUERY, variables: { id: invoiceId } }],
    },
  );
  return {
    removeItem: (id: number) => mutate({ variables: { id } }),
    loading,
    error,
  };
}
