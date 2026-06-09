import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import type { InvoiceStatus } from "@/types/invoices.types";
import {
  ADMIN_INVOICES_QUERY,
  ADMIN_UPDATE_INVOICE_MUTATION,
  ADMIN_DELETE_INVOICE_MUTATION,
} from "../../graphql/admin.operations";
import type { AdminInvoice, AdminConnection } from "@/types/admin.types";
import { gqlFetch, gqlMutate } from "@/lib/apollo";

const LIMIT = 20;

export function useAdminInvoices(status?: InvoiceStatus, search?: string) {
  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery<
    AdminConnection<AdminInvoice>
  >({
    queryKey: [
      "adminInvoices",
      { status: status ?? null, search: search ?? null },
    ],
    queryFn: ({ pageParam }) =>
      gqlFetch<{ adminInvoices: AdminConnection<AdminInvoice> }>(
        ADMIN_INVOICES_QUERY,
        {
          status,
          search,
          pagination: {
            limit: LIMIT,
            ...(pageParam != null ? { cursor: pageParam as number } : {}),
          },
        },
      ).then((d) => d.adminInvoices),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  return {
    invoices: data?.pages.flatMap((p) => p.items) ?? [],
    loading: isLoading,
    total: data?.pages[0]?.total ?? 0,
    hasMore: !!hasNextPage,
    loadMore: () => void fetchNextPage(),
  };
}

export function useAdminCrudInvoices() {
  const queryClient = useQueryClient();

  const { mutateAsync: update } = useMutation({
    mutationFn: (input: {
      id: number;
      status?: InvoiceStatus;
      notes?: string;
      dueDate?: string;
    }) =>
      gqlMutate<{ adminUpdateInvoice: AdminInvoice }>(
        ADMIN_UPDATE_INVOICE_MUTATION,
        { input },
      ).then((d) => d.adminUpdateInvoice),
    onSuccess: (updated) => {
      queryClient.setQueriesData<InfiniteData<AdminConnection<AdminInvoice>>>(
        { queryKey: ["adminInvoices"] },
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
    },
  });

  const { mutateAsync: remove } = useMutation({
    mutationFn: (id: number) =>
      gqlMutate<{ adminDeleteInvoice: { id: number } }>(
        ADMIN_DELETE_INVOICE_MUTATION,
        { id },
      ).then((d) => d.adminDeleteInvoice),
    onSuccess: (_data, id) => {
      queryClient.setQueriesData<InfiniteData<AdminConnection<AdminInvoice>>>(
        { queryKey: ["adminInvoices"] },
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  items: page.items.filter((inv) => inv.id !== id),
                  total: page.total - 1,
                })),
              }
            : old,
      );
    },
  });

  return {
    updateInvoice: (input: Parameters<typeof update>[0]) => update(input),
    deleteInvoice: (id: number) => remove(id),
  };
}
