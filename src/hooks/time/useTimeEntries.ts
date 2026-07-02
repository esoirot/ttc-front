import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import {
  TIME_ENTRIES_QUERY,
  ACTIVE_TIMER_QUERY,
  CREATE_TIME_ENTRY_MUTATION,
  START_TIMER_MUTATION,
  STOP_TIMER_MUTATION,
  UPDATE_TIME_ENTRY_MUTATION,
  RESUME_TIME_ENTRY_MUTATION,
  DELETE_TIME_ENTRY_MUTATION,
} from "../../graphql/time-entries.operations";
import type {
  TimeEntry,
  TimeEntryConnection,
  TimeEntryFilters,
  UpdateTimeEntryInput,
} from "@/types/time-entries.types";
import { gqlFetch, gqlMutate } from "@/lib/apollo";

const LIMIT = 20;

export function useTimeEntries(filters?: TimeEntryFilters) {
  const baseVars = {
    projectId: filters?.projectId,
    ...(filters?.projectIds !== undefined
      ? { projectIds: filters.projectIds }
      : {}),
    taskId: filters?.taskId,
    start: filters?.start,
    end: filters?.end,
  };

  const queryKey = [
    "timeEntries",
    {
      projectId: filters?.projectId ?? null,
      projectIds: filters?.projectIds ?? null,
      taskId: filters?.taskId ?? null,
      start: filters?.start ?? null,
      end: filters?.end ?? null,
    },
  ] as const;

  const { data, fetchNextPage, hasNextPage, isLoading, error, refetch } =
    useInfiniteQuery<TimeEntryConnection>({
      queryKey,
      queryFn: ({ pageParam }) =>
        gqlFetch<{ timeEntries: TimeEntryConnection }>(TIME_ENTRIES_QUERY, {
          ...baseVars,
          pagination: {
            limit: LIMIT,
            ...(pageParam != null ? { cursor: pageParam as number } : {}),
          },
        }).then((d) => d.timeEntries),
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
    });

  return {
    entries: data?.pages.flatMap((p) => p?.items ?? []) ?? [],
    total: data?.pages[0]?.total ?? 0,
    hasMore: !!hasNextPage,
    loadMore: () => void fetchNextPage(),
    loading: isLoading,
    error,
    refetch,
  };
}

export function useActiveTimer() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["activeTimer"],
    queryFn: () =>
      gqlFetch<{ activeTimer: TimeEntry | null }>(ACTIVE_TIMER_QUERY).then(
        (d) => d.activeTimer,
      ),
  });
  return { activeTimer: data ?? null, loading: isLoading, refetch };
}

type CreateTimeEntryInput = {
  projectId?: number;
  taskId?: number;
  subtaskId?: number;
  description?: string;
  startTime: string;
  endTime: string;
  billable?: boolean;
  clockifyEntryId?: string;
  tagIds?: number[];
};

export function useCreateTimeEntry() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (input: CreateTimeEntryInput) =>
      gqlMutate<{ createTimeEntry: TimeEntry }>(CREATE_TIME_ENTRY_MUTATION, {
        input,
      }).then((d) => d.createTimeEntry),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["timeEntries"] });
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
  return {
    createTimeEntry: (input: CreateTimeEntryInput) => mutateAsync(input),
    loading: isPending,
    error,
  };
}

type StartTimerInput = {
  projectId?: number;
  taskId?: number;
  subtaskId?: number;
  description?: string;
  billable?: boolean;
  tagIds?: number[];
};

export function useStartTimer() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (input: StartTimerInput) =>
      gqlMutate<{ startTimer: TimeEntry }>(START_TIMER_MUTATION, {
        input,
      }).then((d) => d.startTimer),
    onSuccess: (started) => {
      queryClient.setQueryData(["activeTimer"], started);
    },
  });
  return {
    startTimer: (input: StartTimerInput) => mutateAsync(input),
    loading: isPending,
    error,
  };
}

export function useStopTimer() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: () =>
      gqlMutate<{ stopTimer: TimeEntry }>(STOP_TIMER_MUTATION).then(
        (d) => d.stopTimer,
      ),
    onSuccess: () => {
      queryClient.setQueryData(["activeTimer"], null);
      void queryClient.invalidateQueries({ queryKey: ["timeEntries"] });
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
  return {
    stopTimer: () => mutateAsync(),
    loading: isPending,
    error,
  };
}

export function useUpdateTimeEntry() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (input: UpdateTimeEntryInput) =>
      gqlMutate<{ updateTimeEntry: TimeEntry }>(UPDATE_TIME_ENTRY_MUTATION, {
        input,
      }).then((d) => d.updateTimeEntry),
    onSuccess: (updated) => {
      queryClient.setQueriesData<InfiniteData<TimeEntryConnection>>(
        { queryKey: ["timeEntries"] },
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  items: page.items.map((e) =>
                    e.id === updated.id ? updated : e,
                  ),
                })),
              }
            : old,
      );
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
  return {
    updateTimeEntry: (input: UpdateTimeEntryInput) => mutateAsync(input),
    loading: isPending,
    error,
  };
}

export function useResumeTimeEntry() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (id: number) =>
      gqlMutate<{ resumeTimeEntry: TimeEntry }>(RESUME_TIME_ENTRY_MUTATION, {
        id,
      }).then((d) => d.resumeTimeEntry),
    onSuccess: (resumed) => {
      queryClient.setQueryData(["activeTimer"], resumed);
      void queryClient.invalidateQueries({ queryKey: ["timeEntries"] });
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
  return {
    resumeTimeEntry: (id: number) => mutateAsync(id),
    loading: isPending,
    error,
  };
}

export function useDeleteTimeEntry() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (id: number) =>
      gqlMutate<{ deleteTimeEntry: boolean }>(DELETE_TIME_ENTRY_MUTATION, {
        id,
      }).then((d) => d.deleteTimeEntry),
    onSuccess: (_data, id) => {
      queryClient.setQueriesData<InfiniteData<TimeEntryConnection>>(
        { queryKey: ["timeEntries"] },
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
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
  return {
    deleteTimeEntry: (id: number) => mutateAsync(id),
    loading: isPending,
    error,
  };
}
