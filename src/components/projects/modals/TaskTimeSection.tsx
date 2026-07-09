import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTask } from "@/hooks/tasks/useTasks";
import { useProject, useProjects } from "@/hooks/projects/useProjects";
import {
  useActiveTimer,
  useStartTimer,
  useStopTimer,
  useTimeEntries,
  useUpdateTimeEntry,
  useDeleteTimeEntry,
  useResumeTimeEntry,
} from "@/hooks/time/useTimeEntries";
import { useTags } from "@/hooks/tags/useTags";
import { TtcEntryRow } from "@/components/time/rows/TtcEntryRow";
import { useElapsedTimer } from "@/hooks/time/useElapsedTimer";
import { secsToHms } from "@/lib/time";
import type { TimeEntry } from "@/types/time-entries.types";

export function TaskTimeSection({
  taskId,
  projectId,
  taskTitle,
}: {
  taskId: number;
  projectId: number;
  taskTitle: string;
}) {
  const { entries, loading } = useTimeEntries({ taskId });
  const { activeTimer } = useActiveTimer();
  const { startTimer, loading: starting } = useStartTimer();
  const { stopTimer, loading: stopping } = useStopTimer();
  const { updateTimeEntry } = useUpdateTimeEntry();
  const { deleteTimeEntry } = useDeleteTimeEntry();
  const { resumeTimeEntry } = useResumeTimeEntry();
  const { project } = useProject(projectId);
  const { projects } = useProjects();
  const { tags } = useTags();
  const { task: taskDetail } = useTask(taskId);
  const subtasks = taskDetail?.subtasks ?? [];
  const [selectedSubtaskId, setSelectedSubtaskId] = useState<number | null>(
    null,
  );
  const [entriesOpen, setEntriesOpen] = useState(false);
  const isActiveOnTask = activeTimer?.taskId === taskId;
  const elapsed = useElapsedTimer(
    isActiveOnTask ? activeTimer?.startTime : null,
  );

  const totalSeconds = entries.reduce(
    (sum, e) => sum + (e.durationSeconds ?? 0),
    0,
  );

  function handleStart() {
    const selectedSub =
      subtasks.find((s) => s.id === selectedSubtaskId) ?? null;
    const desc = project
      ? selectedSub
        ? `Task ${taskTitle} › ${selectedSub.title} of project ${project.title}`
        : `Task ${taskTitle} of project ${project.title}`
      : taskTitle;
    void startTimer({
      taskId,
      projectId,
      subtaskId: selectedSubtaskId ?? undefined,
      description: desc,
    });
  }

  function handleResume(entry: TimeEntry) {
    void resumeTimeEntry(entry.id);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          Time {entries.length > 0 ? `(${entries.length})` : ""}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-6 px-2 text-xs font-mono gap-1"
          onClick={() => setEntriesOpen((o) => !o)}
        >
          ⏱ {secsToHms(totalSeconds)}
          <span className="text-muted-foreground">
            {entriesOpen ? "hide ▲" : "show ▼"}
          </span>
        </Button>
      </div>

      {subtasks.length > 0 && !isActiveOnTask && (
        <Select
          value={
            selectedSubtaskId != null ? String(selectedSubtaskId) : "__none__"
          }
          onValueChange={(v) =>
            setSelectedSubtaskId(v === "__none__" ? null : Number(v))
          }
        >
          <SelectTrigger className="h-6 text-xs">
            <SelectValue placeholder="No subtask" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">No subtask</SelectItem>
            {subtasks.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.checklistTitle
                  ? `${s.checklistTitle} › ${s.title}`
                  : s.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {isActiveOnTask ? (
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 animate-pulse">
            ● {elapsed}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="h-6 px-2 text-xs"
            onClick={() => {
              void stopTimer();
              setSelectedSubtaskId(null);
            }}
            disabled={stopping}
          >
            ⏹ Stop
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs w-fit"
          onClick={handleStart}
          disabled={starting || !!activeTimer}
          title={activeTimer ? "Another timer is already running" : undefined}
        >
          ▶ Start timer
        </Button>
      )}

      {entriesOpen && (
        <>
          {loading && <Skeleton className="h-4 w-full" />}

          {entries.length > 0 && (
            <div className="flex flex-col border border-border rounded-md overflow-hidden">
              {entries.map((e) => (
                <div
                  key={e.id}
                  className="border-b border-border/50 last:border-0"
                >
                  <TtcEntryRow
                    entry={e}
                    projects={projects}
                    tags={tags}
                    onDelete={(id) => void deleteTimeEntry(id)}
                    onResume={handleResume}
                    onUpdate={(input) => void updateTimeEntry(input)}
                    stackedTime
                  />
                </div>
              ))}
            </div>
          )}

          {entries.length === 0 && !loading && (
            <p className="text-xs text-muted-foreground">No time logged yet.</p>
          )}
        </>
      )}
    </div>
  );
}
