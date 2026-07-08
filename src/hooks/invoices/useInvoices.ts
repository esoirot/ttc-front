import { useQuery, useQueryClient } from "@tanstack/react-query";
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
} from "../../graphql/invoices.operations";
import type {
  Invoice,
  InvoiceItem,
  InvoiceStatus,
} from "@/types/invoices.types";
import { gqlFetch } from "@/lib/apollo";
import { useGqlConnectionQuery } from "@/lib/gqlQuery";
import { useGqlMutation } from "@/lib/gqlMutation";
import {
  patchConnection,
  removeFromConnection,
  patchNestedField,
} from "@/lib/cachePatch";

const LIMIT = 20;

export function useInvoices(
  status?: InvoiceStatus,
  clientId?: number,
  search?: string,
) {
  const baseVars = {
    ...(status ? { status } : {}),
    ...(clientId !== undefined ? { clientId } : {}),
    ...(search ? { search } : {}),
  };

  const { items, total, hasMore, loadMore, loading, error } =
    useGqlConnectionQuery({
      queryKey: [
        "invoices",
        {
          status: status ?? null,
          clientId: clientId ?? null,
          search: search ?? null,
        },
      ],
      query: INVOICES_QUERY,
      variables: baseVars,
      select: (d) => d.invoices,
      limit: LIMIT,
    });

  return { invoices: items, total, hasMore, loadMore, loading, error };
}

export function useInvoice(id: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () =>
      gqlFetch<{ invoice: Invoice }>(INVOICE_QUERY, { id }).then(
        (d) => d.invoice ?? null,
      ),
    enabled: !!id,
  });
  return { invoice: data ?? null, loading: isLoading, error };
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useGqlMutation({
    mutation: CREATE_INVOICE_MUTATION,
    unwrap: (d) => d.createInvoice,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
  return {
    createInvoice: (input: {
      clientId?: number;
      currency?: string;
      dueDate?: string;
      notes?: string;
    }) => mutateAsync({ input }),
    loading: isPending,
    error,
  };
}

export function useGenerateInvoice() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useGqlMutation({
    mutation: GENERATE_INVOICE_MUTATION,
    unwrap: (d) => d.generateInvoice,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
  return {
    generateInvoice: (input: {
      projectId: number;
      clientId?: number;
      currency?: string;
      dueDate?: string;
      hourlyRate?: number;
    }) => mutateAsync({ input }),
    loading: isPending,
    error,
  };
}

export function useUpdateInvoice(id: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useGqlMutation({
    mutation: UPDATE_INVOICE_MUTATION,
    unwrap: (d) => d.updateInvoice,
    onSuccess: (updated) => {
      patchConnection(queryClient, ["invoices"], updated, (inv) => inv.id);
      queryClient.setQueryData(["invoice", id], updated);
    },
  });
  return {
    updateInvoice: (input: {
      id: number;
      status?: InvoiceStatus;
      currency?: string;
      dueDate?: string;
      paidAt?: string;
      notes?: string;
      clientId?: number;
    }) => mutateAsync({ input }),
    loading: isPending,
    error,
  };
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useGqlMutation({
    mutation: DELETE_INVOICE_MUTATION,
    unwrap: (d) => d.deleteInvoice,
    onSuccess: (_data, { id }) => {
      removeFromConnection(
        queryClient,
        ["invoices"],
        id,
        (inv: Invoice) => inv.id,
      );
      queryClient.removeQueries({ queryKey: ["invoice", id] });
    },
  });
  return {
    deleteInvoice: (invoiceId: number) => mutateAsync({ id: invoiceId }),
    loading: isPending,
    error,
  };
}

export function useAddInvoiceItem(invoiceId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useGqlMutation({
    mutation: ADD_INVOICE_ITEM_MUTATION,
    unwrap: (d) => d.addInvoiceItem,
    onSuccess: (newItem) => {
      patchNestedField<Invoice, InvoiceItem>(
        queryClient,
        ["invoice", invoiceId],
        "items",
        newItem,
        (i) => i.id,
        "add",
      );
    },
  });
  return {
    addItem: (input: {
      invoiceId: number;
      description?: string;
      quantity: number;
      unitPrice: number;
      projectId?: number;
      timeEntryId?: number;
    }) => mutateAsync({ input }),
    loading: isPending,
    error,
  };
}

export function useUpdateInvoiceItem(invoiceId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync } = useGqlMutation({
    mutation: UPDATE_INVOICE_ITEM_MUTATION,
    unwrap: (d) => d.updateInvoiceItem,
    onSuccess: (updated) => {
      patchNestedField<Invoice, InvoiceItem>(
        queryClient,
        ["invoice", invoiceId],
        "items",
        updated,
        (i) => i.id,
        "upsert",
      );
    },
  });
  return {
    updateItem: (input: {
      id: number;
      description?: string;
      quantity?: number;
      unitPrice?: number;
    }) => mutateAsync({ input }),
  };
}

export function useRemoveInvoiceItem(invoiceId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useGqlMutation({
    mutation: REMOVE_INVOICE_ITEM_MUTATION,
    unwrap: (d) => d.removeInvoiceItem,
    onSuccess: (_data, { id }) => {
      queryClient.setQueryData<Invoice>(["invoice", invoiceId], (old) =>
        old
          ? { ...old, items: old.items.filter((item) => item.id !== id) }
          : old,
      );
    },
  });
  return {
    removeItem: (itemId: number) => mutateAsync({ id: itemId }),
    loading: isPending,
    error,
  };
}
