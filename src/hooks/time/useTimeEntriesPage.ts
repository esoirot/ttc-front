import { useState } from "react";
import {
  useTimeEntries,
  useActiveTimer,
  useStopTimer,
  useDeleteTimeEntry,
  useUpdateTimeEntry,
  useStartTimer,
  useResumeTimeEntry,
} from "./useTimeEntries";
import { useDateRangeFilter } from "./useDateRangeFilter";
import { useClockifyStatus } from "../integrations/useClockify";
import { useProjects } from "../projects/useProjects";
import { useTags } from "../tags/useTags";

export function useTimeEntriesPage() {
  const { startDate, setStartDate, endDate, setEndDate, startIso, endIso } =
    useDateRangeFilter();

  const { entries, loading, hasMore, loadMore, total, refetch } =
    useTimeEntries({ start: startIso, end: endIso });
  const { activeTimer } = useActiveTimer();
  const { stopTimer, loading: stopping } = useStopTimer();
  const { deleteTimeEntry } = useDeleteTimeEntry();
  const { updateTimeEntry } = useUpdateTimeEntry();
  const { startTimer } = useStartTimer();
  const { resumeTimeEntry } = useResumeTimeEntry();
  const { projects } = useProjects();
  const { tags } = useTags();

  const { data: clockifyStatus } = useClockifyStatus();
  const workspaceId = clockifyStatus?.connected
    ? (clockifyStatus.workspaceId ?? null)
    : null;

  const [showManual, setShowManual] = useState(false);
  const [showImport, setShowImport] = useState(false);

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

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    entries,
    loading,
    hasMore,
    loadMore,
    total,
    refetch,
    activeTimer,
    stopTimer,
    stopping,
    deleteTimeEntry,
    updateTimeEntry,
    startTimer,
    resumeTimeEntry,
    projects,
    tags,
    workspaceId,
    showManual,
    setShowManual,
    showImport,
    setShowImport,
    totalSeconds,
    recentDescriptions,
  };
}
