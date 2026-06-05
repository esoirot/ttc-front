import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import {
  ADMIN_CLIENTS_QUERY,
  ADMIN_CREATE_CLIENT_MUTATION,
  ADMIN_UPDATE_CLIENT_MUTATION,
  ADMIN_DELETE_CLIENT_MUTATION,
} from "../../graphql/admin.operations";
import type { AdminClient, AdminConnection } from "@/types/admin.types";
import { gqlRequest } from "@/lib/api";

const LIMIT = 20;

export function useAdminClients(search?: string) {
  const { data, fetchNextPage, hasNextPage, isLoading, refetch } =
    useInfiniteQuery<AdminConnection<AdminClient>>({
      queryKey: ["adminClients", { search: search ?? null }],
      queryFn: ({ pageParam }) =>
        gqlRequest<{ adminClients: AdminConnection<AdminClient> }>(
          ADMIN_CLIENTS_QUERY,
          {
            search,
            pagination: {
              limit: LIMIT,
              ...(pageParam != null ? { cursor: pageParam as number } : {}),
            },
          },
        ).then((d) => d.adminClients),
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });

  return {
    clients: data?.pages.flatMap((p) => p.items) ?? [],
    loading: isLoading,
    total: data?.pages[0]?.total ?? 0,
    hasMore: !!hasNextPage,
    loadMore: () => void fetchNextPage(),
    refetch,
  };
}

export function useAdminCrudClients() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: ["adminClients"] });

  const { mutateAsync: create } = useMutation({
    mutationFn: (input: {
      userId: number;
      name: string;
      email?: string;
      phone?: string;
      city?: string;
      country?: string;
    }) =>
      gqlRequest<{ adminCreateClient: AdminClient }>(
        ADMIN_CREATE_CLIENT_MUTATION,
        { input },
      ).then((d) => d.adminCreateClient),
    onSuccess: invalidate,
  });

  const { mutateAsync: update } = useMutation({
    mutationFn: (input: {
      id: number;
      name?: string;
      email?: string;
      phone?: string;
      legalName?: string;
      city?: string;
      country?: string;
      postalCode?: string;
      vatNumber?: string;
      address?: string;
    }) =>
      gqlRequest<{ adminUpdateClient: AdminClient }>(
        ADMIN_UPDATE_CLIENT_MUTATION,
        { input },
      ).then((d) => d.adminUpdateClient),
    onSuccess: (updated) => {
      queryClient.setQueriesData<InfiniteData<AdminConnection<AdminClient>>>(
        { queryKey: ["adminClients"] },
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  items: page.items.map((c) =>
                    c.id === updated.id ? updated : c,
                  ),
                })),
              }
            : old,
      );
    },
  });

  const { mutateAsync: remove } = useMutation({
    mutationFn: (id: number) =>
      gqlRequest<{ adminDeleteClient: { id: number } }>(
        ADMIN_DELETE_CLIENT_MUTATION,
        { id },
      ).then((d) => d.adminDeleteClient),
    onSuccess: (_data, id) => {
      queryClient.setQueriesData<InfiniteData<AdminConnection<AdminClient>>>(
        { queryKey: ["adminClients"] },
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  items: page.items.filter((c) => c.id !== id),
                  total: page.total - 1,
                })),
              }
            : old,
      );
    },
  });

  return {
    createClient: (input: Parameters<typeof create>[0]) => create(input),
    updateClient: (input: Parameters<typeof update>[0]) => update(input),
    deleteClient: (id: number) => remove(id),
  };
}
