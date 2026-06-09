import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import type { ProjectStatus } from "@/types/projects.types";
import {
  ADMIN_PROJECTS_QUERY,
  ADMIN_CREATE_PROJECT_MUTATION,
  ADMIN_UPDATE_PROJECT_MUTATION,
  ADMIN_DELETE_PROJECT_MUTATION,
} from "../../graphql/admin.operations";
import type { AdminProject, AdminConnection } from "@/types/admin.types";
import { gqlFetch, gqlMutate } from "@/lib/apollo";

const LIMIT = 20;

export function useAdminProjects(status?: ProjectStatus, search?: string) {
  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery<
    AdminConnection<AdminProject>
  >({
    queryKey: [
      "adminProjects",
      { status: status ?? null, search: search ?? null },
    ],
    queryFn: ({ pageParam }) =>
      gqlFetch<{ adminProjects: AdminConnection<AdminProject> }>(
        ADMIN_PROJECTS_QUERY,
        {
          status,
          search,
          pagination: {
            limit: LIMIT,
            ...(pageParam != null ? { cursor: pageParam as number } : {}),
          },
        },
      ).then((d) => d.adminProjects),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  return {
    projects: data?.pages.flatMap((p) => p.items) ?? [],
    loading: isLoading,
    total: data?.pages[0]?.total ?? 0,
    hasMore: !!hasNextPage,
    loadMore: () => void fetchNextPage(),
  };
}

export function useAdminCrudProjects() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: ["adminProjects"] });

  const { mutateAsync: create } = useMutation({
    mutationFn: (input: {
      userId: number;
      title: string;
      status?: ProjectStatus;
      clientId?: number;
      currency?: string;
    }) =>
      gqlMutate<{ adminCreateProject: AdminProject }>(
        ADMIN_CREATE_PROJECT_MUTATION,
        { input },
      ).then((d) => d.adminCreateProject),
    onSuccess: invalidate,
  });

  const { mutateAsync: update } = useMutation({
    mutationFn: (input: {
      id: number;
      title?: string;
      status?: ProjectStatus;
      description?: string;
      wordCount?: number;
      unitPrice?: number;
      deadline?: string;
    }) =>
      gqlMutate<{ adminUpdateProject: AdminProject }>(
        ADMIN_UPDATE_PROJECT_MUTATION,
        { input },
      ).then((d) => d.adminUpdateProject),
    onSuccess: (updated) => {
      queryClient.setQueriesData<InfiniteData<AdminConnection<AdminProject>>>(
        { queryKey: ["adminProjects"] },
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  items: page.items.map((p) =>
                    p.id === updated.id ? updated : p,
                  ),
                })),
              }
            : old,
      );
    },
  });

  const { mutateAsync: remove } = useMutation({
    mutationFn: (id: number) =>
      gqlMutate<{ adminDeleteProject: { id: number } }>(
        ADMIN_DELETE_PROJECT_MUTATION,
        { id },
      ).then((d) => d.adminDeleteProject),
    onSuccess: (_data, id) => {
      queryClient.setQueriesData<InfiniteData<AdminConnection<AdminProject>>>(
        { queryKey: ["adminProjects"] },
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  items: page.items.filter((p) => p.id !== id),
                  total: page.total - 1,
                })),
              }
            : old,
      );
    },
  });

  return {
    createProject: (input: Parameters<typeof create>[0]) => create(input),
    updateProject: (input: Parameters<typeof update>[0]) => update(input),
    deleteProject: (id: number) => remove(id),
  };
}
