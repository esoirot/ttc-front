import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  TimeEntryFilters,
  UpdateTimeEntryInput,
} from "@/types/time-entries.types";
import { gqlFetch } from "@/lib/apollo";
import { useGqlConnectionQuery } from "@/lib/gqlQuery";
import { useGqlMutation } from "@/lib/gqlMutation";
import { patchConnection, removeFromConnection } from "@/lib/cachePatch";

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

  const { items, total, hasMore, loadMore, loading, error, refetch } =
    useGqlConnectionQuery({
      queryKey,
      query: TIME_ENTRIES_QUERY,
      variables: baseVars,
      select: (d) => d.timeEntries,
      limit: LIMIT,
    });

  return { entries: items, total, hasMore, loadMore, loading, error, refetch };
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
  const { mutateAsync, isPending, error } = useGqlMutation({
    mutation: CREATE_TIME_ENTRY_MUTATION,
    unwrap: (d) => d.createTimeEntry,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["timeEntries"] });
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
  return {
    createTimeEntry: (input: CreateTimeEntryInput) => mutateAsync({ input }),
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
  const { mutateAsync, isPending, error } = useGqlMutation({
    mutation: START_TIMER_MUTATION,
    unwrap: (d) => d.startTimer,
    onSuccess: (started) => {
      queryClient.setQueryData(["activeTimer"], started);
    },
  });
  return {
    startTimer: (input: StartTimerInput) => mutateAsync({ input }),
    loading: isPending,
    error,
  };
}

export function useStopTimer() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useGqlMutation({
    mutation: STOP_TIMER_MUTATION,
    unwrap: (d) => d.stopTimer,
    onSuccess: () => {
      queryClient.setQueryData(["activeTimer"], null);
      void queryClient.invalidateQueries({ queryKey: ["timeEntries"] });
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
  return {
    stopTimer: () => mutateAsync({}),
    loading: isPending,
    error,
  };
}

export function useUpdateTimeEntry() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useGqlMutation({
    mutation: UPDATE_TIME_ENTRY_MUTATION,
    unwrap: (d) => d.updateTimeEntry,
    onSuccess: (updated) => {
      patchConnection(queryClient, ["timeEntries"], updated, (e) => e.id);
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
  return {
    updateTimeEntry: (input: UpdateTimeEntryInput) => mutateAsync({ input }),
    loading: isPending,
    error,
  };
}

export function useResumeTimeEntry() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useGqlMutation({
    mutation: RESUME_TIME_ENTRY_MUTATION,
    unwrap: (d) => d.resumeTimeEntry,
    onSuccess: (resumed) => {
      queryClient.setQueryData(["activeTimer"], resumed);
      void queryClient.invalidateQueries({ queryKey: ["timeEntries"] });
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
  return {
    resumeTimeEntry: (id: number) => mutateAsync({ id }),
    loading: isPending,
    error,
  };
}

export function useDeleteTimeEntry() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useGqlMutation({
    mutation: DELETE_TIME_ENTRY_MUTATION,
    unwrap: (d) => d.deleteTimeEntry,
    onSuccess: (_data, { id }) => {
      removeFromConnection(
        queryClient,
        ["timeEntries"],
        id,
        (e: TimeEntry) => e.id,
      );
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
  return {
    deleteTimeEntry: (id: number) => mutateAsync({ id }),
    loading: isPending,
    error,
  };
}
