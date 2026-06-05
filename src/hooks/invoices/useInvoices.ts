import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
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
  InvoiceConnection,
  InvoiceStatus,
} from "@/types/invoices.types";
import { gqlRequest } from "@/lib/api";

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

  const { data, fetchNextPage, hasNextPage, isLoading, error } =
    useInfiniteQuery<InvoiceConnection>({
      queryKey: [
        "invoices",
        {
          status: status ?? null,
          clientId: clientId ?? null,
          search: search ?? null,
        },
      ],
      queryFn: ({ pageParam }) =>
        gqlRequest<{ invoices: InvoiceConnection }>(INVOICES_QUERY, {
          ...baseVars,
          pagination: {
            limit: LIMIT,
            ...(pageParam != null ? { cursor: pageParam as number } : {}),
          },
        }).then((d) => d.invoices),
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });

  return {
    invoices: data?.pages.flatMap((p) => p.items) ?? [],
    total: data?.pages[0]?.total ?? 0,
    hasMore: !!hasNextPage,
    loadMore: () => void fetchNextPage(),
    loading: isLoading,
    error,
  };
}

export function useInvoice(id: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () =>
      gqlRequest<{ invoice: Invoice }>(INVOICE_QUERY, { id }).then(
        (d) => d.invoice,
      ),
    enabled: !!id,
  });
  return { invoice: data ?? null, loading: isLoading, error };
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (input: {
      clientId?: number;
      currency?: string;
      dueDate?: string;
      notes?: string;
    }) =>
      gqlRequest<{ createInvoice: Invoice }>(CREATE_INVOICE_MUTATION, {
        input,
      }).then((d) => d.createInvoice),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
  return {
    createInvoice: (input: Parameters<typeof mutateAsync>[0]) =>
      mutateAsync(input),
    loading: isPending,
    error,
  };
}

export function useGenerateInvoice() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (input: {
      projectId: number;
      clientId?: number;
      currency?: string;
      dueDate?: string;
      hourlyRate?: number;
    }) =>
      gqlRequest<{ generateInvoice: Invoice }>(GENERATE_INVOICE_MUTATION, {
        input,
      }).then((d) => d.generateInvoice),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
  return {
    generateInvoice: (input: Parameters<typeof mutateAsync>[0]) =>
      mutateAsync(input),
    loading: isPending,
    error,
  };
}

export function useUpdateInvoice(id: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (input: {
      id: number;
      status?: InvoiceStatus;
      currency?: string;
      dueDate?: string;
      paidAt?: string;
      notes?: string;
      clientId?: number;
    }) =>
      gqlRequest<{ updateInvoice: Invoice }>(UPDATE_INVOICE_MUTATION, {
        input,
      }).then((d) => d.updateInvoice),
    onSuccess: (updated) => {
      queryClient.setQueriesData<InfiniteData<InvoiceConnection>>(
        { queryKey: ["invoices"] },
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  items: page.items.map((inv) =>
                    inv.id === updated.id ? updated : inv,
                  ),
                })),
              }
            : old,
      );
      queryClient.setQueryData(["invoice", id], updated);
    },
  });
  return {
    updateInvoice: (input: Parameters<typeof mutateAsync>[0]) =>
      mutateAsync(input),
    loading: isPending,
    error,
  };
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (invoiceId: number) =>
      gqlRequest<{ deleteInvoice: boolean }>(DELETE_INVOICE_MUTATION, {
        id: invoiceId,
      }).then((d) => d.deleteInvoice),
    onSuccess: (_data, invoiceId) => {
      queryClient.setQueriesData<InfiniteData<InvoiceConnection>>(
        { queryKey: ["invoices"] },
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  items: page.items.filter((inv) => inv.id !== invoiceId),
                  total: page.total - 1,
                })),
              }
            : old,
      );
      queryClient.removeQueries({ queryKey: ["invoice", invoiceId] });
    },
  });
  return {
    deleteInvoice: (invoiceId: number) => mutateAsync(invoiceId),
    loading: isPending,
    error,
  };
}

export function useAddInvoiceItem(invoiceId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (input: {
      invoiceId: number;
      description?: string;
      quantity: number;
      unitPrice: number;
      projectId?: number;
      timeEntryId?: number;
    }) =>
      gqlRequest<{ addInvoiceItem: InvoiceItem }>(ADD_INVOICE_ITEM_MUTATION, {
        input,
      }).then((d) => d.addInvoiceItem),
    onSuccess: (newItem) => {
      queryClient.setQueryData<Invoice>(["invoice", invoiceId], (old) =>
        old ? { ...old, items: [...old.items, newItem] } : old,
      );
    },
  });
  return {
    addItem: (input: Parameters<typeof mutateAsync>[0]) => mutateAsync(input),
    loading: isPending,
    error,
  };
}

export function useUpdateInvoiceItem(invoiceId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: (input: {
      id: number;
      description?: string;
      quantity?: number;
      unitPrice?: number;
    }) =>
      gqlRequest<{ updateInvoiceItem: InvoiceItem }>(
        UPDATE_INVOICE_ITEM_MUTATION,
        { input },
      ).then((d) => d.updateInvoiceItem),
    onSuccess: (updated) => {
      queryClient.setQueryData<Invoice>(["invoice", invoiceId], (old) =>
        old
          ? {
              ...old,
              items: old.items.map((item) =>
                item.id === updated.id ? updated : item,
              ),
            }
          : old,
      );
    },
  });
  return {
    updateItem: (input: {
      id: number;
      description?: string;
      quantity?: number;
      unitPrice?: number;
    }) => mutateAsync(input),
  };
}

export function useRemoveInvoiceItem(invoiceId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (itemId: number) =>
      gqlRequest<{ removeInvoiceItem: boolean }>(REMOVE_INVOICE_ITEM_MUTATION, {
        id: itemId,
      }).then((d) => d.removeInvoiceItem),
    onSuccess: (_data, itemId) => {
      queryClient.setQueryData<Invoice>(["invoice", invoiceId], (old) =>
        old
          ? { ...old, items: old.items.filter((item) => item.id !== itemId) }
          : old,
      );
    },
  });
  return {
    removeItem: (itemId: number) => mutateAsync(itemId),
    loading: isPending,
    error,
  };
}
