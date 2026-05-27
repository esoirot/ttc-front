import {
  useTimeEntries,
  useActiveTimer,
  useStartTimer,
  useStopTimer,
  useDeleteTimeEntry,
  useUpdateTimeEntry,
} from "../time/useTimeEntries";
import { useProjects } from "./useProjects";
import { useTags } from "../tags/useTags";
import type { TimeEntry } from "@/types/time-entries.types";

export function useProjectTimeTab(projectId: number) {
  const { entries, loading, hasMore, loadMore, refetch } = useTimeEntries({
    projectId,
  });
  const { activeTimer } = useActiveTimer();
  const { startTimer } = useStartTimer();
  const { stopTimer, loading: stopping } = useStopTimer();
  const { deleteTimeEntry } = useDeleteTimeEntry();
  const { updateTimeEntry } = useUpdateTimeEntry();
  const { projects } = useProjects();
  const { tags } = useTags();

  const totalSeconds = entries.reduce(
    (s, e) => s + (e.durationSeconds ?? 0),
    0,
  );
  const recentDescriptions = [
    ...new Set(
      entries
        .map((e) => e.description)
        .filter((d): d is string => d !== null && d.trim() !== ""),
    ),
  ];

  function handleResume(entry: TimeEntry) {
    void startTimer({
      description: entry.description ?? undefined,
      projectId: entry.projectId ?? undefined,
      billable: entry.billable,
      tagIds: entry.tags.map((t) => t.id),
    });
  }

  return {
    entries,
    loading,
    hasMore,
    loadMore,
    refetch,
    activeTimer,
    stopTimer,
    stopping,
    deleteTimeEntry,
    updateTimeEntry,
    projects,
    tags,
    totalSeconds,
    recentDescriptions,
    handleResume,
  };
}
