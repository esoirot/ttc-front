import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import {
  PROJECTS_QUERY,
  PROJECT_QUERY,
  CREATE_PROJECT_MUTATION,
  UPDATE_PROJECT_MUTATION,
  DELETE_PROJECT_MUTATION,
} from "../../graphql/projects.operations";
import type {
  Project,
  ProjectConnection,
  ProjectStatus,
} from "@/types/projects.types";
import { gqlRequest } from "@/lib/api";

const LIMIT = 20;

type ProjectInput = {
  title: string;
  description?: string;
  clientId?: number | null;
  status?: ProjectStatus;
  sourceLanguage?: string;
  targetLanguage?: string;
  wordCount?: number;
  unitPrice?: number;
  fixedFee?: number | null;
  hourlyRate?: number | null;
  perWordRate?: number | null;
  currency?: string;
  deadline?: string;
  startDate?: string;
};

export function useProjects(status?: ProjectStatus, search?: string) {
  const baseVars = {
    ...(status ? { status } : {}),
    ...(search ? { search } : {}),
  };

  const { data, fetchNextPage, hasNextPage, isLoading, error } =
    useInfiniteQuery<ProjectConnection>({
      queryKey: [
        "projects",
        { status: status ?? null, search: search ?? null },
      ],
      queryFn: ({ pageParam }) =>
        gqlRequest<{ projects: ProjectConnection }>(PROJECTS_QUERY, {
          ...baseVars,
          pagination: {
            limit: LIMIT,
            ...(pageParam != null ? { cursor: pageParam as number } : {}),
          },
        }).then((d) => d.projects),
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });

  return {
    projects: data?.pages.flatMap((p) => p.items) ?? [],
    total: data?.pages[0]?.total ?? 0,
    hasMore: !!hasNextPage,
    loadMore: () => void fetchNextPage(),
    loading: isLoading,
    error,
  };
}

export function useProject(id: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["project", id],
    queryFn: () =>
      gqlRequest<{ project: Project | null }>(PROJECT_QUERY, { id }).then(
        (d) => d.project,
      ),
    enabled: !!id,
  });
  return { project: data ?? null, loading: isLoading, error };
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (input: ProjectInput) =>
      gqlRequest<{ createProject: Project }>(CREATE_PROJECT_MUTATION, {
        input,
      }).then((d) => d.createProject),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
  return {
    createProject: (input: ProjectInput) => mutateAsync(input),
    loading: isPending,
    error,
  };
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (input: Partial<ProjectInput> & { id: number }) =>
      gqlRequest<{ updateProject: Project }>(UPDATE_PROJECT_MUTATION, {
        input,
      }).then((d) => d.updateProject),
    onSuccess: (updated) => {
      queryClient.setQueriesData<InfiniteData<ProjectConnection>>(
        { queryKey: ["projects"] },
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
      queryClient.setQueryData(["project", updated.id], updated);
    },
  });
  return {
    updateProject: (input: Partial<ProjectInput> & { id: number }) =>
      mutateAsync(input),
    loading: isPending,
    error,
  };
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (id: number) =>
      gqlRequest<{ deleteProject: boolean }>(DELETE_PROJECT_MUTATION, {
        id,
      }).then((d) => d.deleteProject),
    onSuccess: (_data, id) => {
      queryClient.setQueriesData<InfiniteData<ProjectConnection>>(
        { queryKey: ["projects"] },
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
      queryClient.removeQueries({ queryKey: ["project", id] });
    },
  });
  return {
    deleteProject: (id: number) => mutateAsync(id),
    loading: isPending,
    error,
  };
}
