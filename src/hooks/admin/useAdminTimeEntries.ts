import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import {
  ADMIN_TIME_ENTRIES_QUERY,
  ADMIN_DELETE_TIME_ENTRY_MUTATION,
} from "../../graphql/admin.operations";
import type { AdminTimeEntry, AdminConnection } from "@/types/admin.types";
import { gqlFetch, gqlMutate } from "@/lib/apollo";

const LIMIT = 20;

export function useAdminTimeEntries(userId?: number) {
  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery<
    AdminConnection<AdminTimeEntry>
  >({
    queryKey: ["adminTimeEntries", { userId: userId ?? null }],
    queryFn: ({ pageParam }) =>
      gqlFetch<{ adminTimeEntries: AdminConnection<AdminTimeEntry> }>(
        ADMIN_TIME_ENTRIES_QUERY,
        {
          userId,
          pagination: {
            limit: LIMIT,
            ...(pageParam != null ? { cursor: pageParam as number } : {}),
          },
        },
      ).then((d) => d.adminTimeEntries),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  return {
    entries: data?.pages.flatMap((p) => p.items) ?? [],
    loading: isLoading,
    total: data?.pages[0]?.total ?? 0,
    hasMore: !!hasNextPage,
    loadMore: () => void fetchNextPage(),
  };
}

export function useAdminDeleteTimeEntry() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: (id: number) =>
      gqlMutate<{ adminDeleteTimeEntry: { id: number } }>(
        ADMIN_DELETE_TIME_ENTRY_MUTATION,
        { id },
      ).then((d) => d.adminDeleteTimeEntry),
    onSuccess: (_data, id) => {
      queryClient.setQueriesData<InfiniteData<AdminConnection<AdminTimeEntry>>>(
        { queryKey: ["adminTimeEntries"] },
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  items: page.items.filter((e) => e.id !== id),
                  total: page.total - 1,
                })),
              }
            : old,
      );
    },
  });
  return { deleteEntry: (id: number) => mutateAsync(id) };
}
