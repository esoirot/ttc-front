import {
  useTimeEntries,
  useActiveTimer,
  useStopTimer,
  useDeleteTimeEntry,
  useUpdateTimeEntry,
  useResumeTimeEntry,
} from "../time/useTimeEntries";
import { useProjects } from "./useProjects";
import { useTags } from "../tags/useTags";
import type { TimeEntry } from "@/types/time-entries.types";

export function useProjectTimeTab(projectId: number) {
  const { entries, loading, hasMore, loadMore, refetch } = useTimeEntries({
    projectId,
  });
  const { activeTimer } = useActiveTimer();
  const { stopTimer, loading: stopping } = useStopTimer();
  const { deleteTimeEntry } = useDeleteTimeEntry();
  const { updateTimeEntry } = useUpdateTimeEntry();
  const { resumeTimeEntry } = useResumeTimeEntry();
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
    void resumeTimeEntry(entry.id);
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
