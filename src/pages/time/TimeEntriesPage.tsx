import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  useTimeEntries,
  useActiveTimer,
  useStopTimer,
  useDeleteTimeEntry,
  useUpdateTimeEntry,
  useStartTimer,
} from "../../hooks/time/useTimeEntries";
import { useDateRangeFilter } from "../../hooks/time/useDateRangeFilter";
import { useClockifyStatus } from "../../hooks/integrations/useClockify";
import { useProjects } from "../../hooks/projects/useProjects";
import { ActiveTimerBanner } from "../../components/time/ActiveTimerBanner";
import { TimerStartInput } from "../../components/time/TimerStartInput";
import { ManualEntryForm } from "../../components/time/ManualEntryForm";
import { ClockifyImportForm } from "../../components/time/ClockifyImportForm";
import { DateRangeFilter } from "../../components/time/DateRangeFilter";
import { EntryList } from "../../components/time/EntryList";

export function TimeEntriesPage() {
  const { startDate, setStartDate, endDate, setEndDate, startIso, endIso } =
    useDateRangeFilter();

  const { entries, loading, hasMore, loadMore, total, refetch } =
    useTimeEntries({ start: startIso, end: endIso });
  const { activeTimer } = useActiveTimer();
  const { stopTimer, loading: stopping } = useStopTimer();
  const { deleteTimeEntry } = useDeleteTimeEntry();
  const { updateTimeEntry } = useUpdateTimeEntry();
  const { startTimer } = useStartTimer();
  const { projects } = useProjects();

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

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Time Entries</h1>
        <div className="flex gap-2">
          {workspaceId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowImport((v) => !v);
              }}
            >
              {showImport ? "Cancel import" : "Import from Clockify"}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowManual((v) => !v)}
          >
            {showManual ? "Cancel" : "Log entry"}
          </Button>
        </div>
      </div>

      {showImport && workspaceId && (
        <ClockifyImportForm
          workspaceId={workspaceId}
          refetch={refetch}
          onClose={() => setShowImport(false)}
        />
      )}

      {activeTimer ? (
        <ActiveTimerBanner
          activeTimer={activeTimer}
          stopTimer={stopTimer}
          stopping={stopping}
          refetch={refetch}
        />
      ) : (
        <TimerStartInput />
      )}

      {showManual && <ManualEntryForm onClose={() => setShowManual(false)} />}

      <DateRangeFilter
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        count={entries.length}
        total={total}
        totalSeconds={totalSeconds}
      />

      <EntryList
        entries={entries}
        loading={loading}
        hasMore={hasMore}
        loadMore={loadMore}
        deleteTimeEntry={deleteTimeEntry}
        projects={projects}
        onResume={(entry) =>
          void startTimer({
            description: entry.description ?? undefined,
            projectId: entry.projectId ?? undefined,
            billable: entry.billable,
          })
        }
        onUpdate={(input) => void updateTimeEntry(input)}
      />
    </div>
  );
}
