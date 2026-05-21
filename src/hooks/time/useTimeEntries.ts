import { useQuery, useMutation } from "@apollo/client/react";
import { useEffect } from "react";
import {
  TIME_ENTRIES_QUERY,
  ACTIVE_TIMER_QUERY,
  TIMER_UPDATED_SUBSCRIPTION,
  CREATE_TIME_ENTRY_MUTATION,
  START_TIMER_MUTATION,
  STOP_TIMER_MUTATION,
  UPDATE_TIME_ENTRY_MUTATION,
  DELETE_TIME_ENTRY_MUTATION,
  type TimeEntry,
  type TimeEntryConnection,
} from "../../graphql/time-entries.operations";
import { useCurrentUser } from "../auth/useAuth";

export type { TimeEntry, TimeEntryConnection };

const LIMIT = 20;
const FIRST_PAGE = { limit: LIMIT };

export function useTimeEntries(filters?: {
  projectId?: number;
  projectIds?: number[];
  start?: string;
  end?: string;
}) {
  const baseVars = {
    projectId: filters?.projectId,
    ...(filters?.projectIds !== undefined
      ? { projectIds: filters.projectIds }
      : {}),
    start: filters?.start,
    end: filters?.end,
    pagination: FIRST_PAGE,
  };

  const { data, fetchMore, loading, error, refetch } = useQuery(
    TIME_ENTRIES_QUERY,
    { variables: baseVars },
  );

  const nextCursor = data?.timeEntries.nextCursor ?? null;

  function loadMore() {
    void fetchMore({
      variables: {
        ...baseVars,
        pagination: { limit: LIMIT, cursor: nextCursor ?? undefined },
      },
      updateQuery(prev, { fetchMoreResult }) {
        if (!fetchMoreResult) return prev;
        return {
          timeEntries: {
            ...fetchMoreResult.timeEntries,
            items: [
              ...prev.timeEntries.items,
              ...fetchMoreResult.timeEntries.items,
            ],
          },
        };
      },
    });
  }

  return {
    entries: data?.timeEntries.items ?? [],
    total: data?.timeEntries.total ?? 0,
    hasMore: nextCursor !== null,
    loadMore,
    loading,
    error,
    refetch,
  };
}

export function useActiveTimer() {
  const { user } = useCurrentUser();
  const { data, loading, refetch, subscribeToMore } = useQuery(
    ACTIVE_TIMER_QUERY,
    { pollInterval: 30_000 },
  );

  useEffect(() => {
    if (!user?.id) return;
    return subscribeToMore<
      { timerUpdated: TimeEntry | null },
      { userId: number }
    >({
      document: TIMER_UPDATED_SUBSCRIPTION,
      variables: { userId: Number(user.id) },
      updateQuery(_prev, { subscriptionData }) {
        return { activeTimer: subscriptionData.data.timerUpdated };
      },
    });
  }, [user?.id, subscribeToMore]);

  return { activeTimer: data?.activeTimer ?? null, loading, refetch };
}

export function useCreateTimeEntry() {
  const [mutate, { loading, error }] = useMutation(CREATE_TIME_ENTRY_MUTATION, {
    refetchQueries: ["TimeEntries"],
  });
  return {
    createTimeEntry: (
      input: Parameters<typeof mutate>[0]["variables"]["input"],
    ) => mutate({ variables: { input } }),
    loading,
    error,
  };
}

export function useStartTimer() {
  const [mutate, { loading, error }] = useMutation(START_TIMER_MUTATION, {
    refetchQueries: [{ query: ACTIVE_TIMER_QUERY }],
  });
  return {
    startTimer: (input: Parameters<typeof mutate>[0]["variables"]["input"]) =>
      mutate({ variables: { input } }),
    loading,
    error,
  };
}

export function useStopTimer() {
  const [mutate, { loading, error }] = useMutation(STOP_TIMER_MUTATION, {
    // "TimeEntries" string refetches all active TimeEntries watchers regardless
    // of their variables — the page query includes start/end filters that the
    // fixed { query, variables } form would miss (different cache key).
    refetchQueries: [{ query: ACTIVE_TIMER_QUERY }, "TimeEntries"],
  });
  return {
    stopTimer: () => mutate(),
    loading,
    error,
  };
}

export function useUpdateTimeEntry() {
  const [mutate, { loading, error }] = useMutation(UPDATE_TIME_ENTRY_MUTATION, {
    refetchQueries: ["TimeEntries"],
  });
  return {
    updateTimeEntry: (
      input: Parameters<typeof mutate>[0]["variables"]["input"],
    ) => mutate({ variables: { input } }),
    loading,
    error,
  };
}

export function useDeleteTimeEntry() {
  const [mutate, { loading, error }] = useMutation(DELETE_TIME_ENTRY_MUTATION, {
    refetchQueries: ["TimeEntries"],
  });
  return {
    deleteTimeEntry: (id: number) => mutate({ variables: { id } }),
    loading,
    error,
  };
}
