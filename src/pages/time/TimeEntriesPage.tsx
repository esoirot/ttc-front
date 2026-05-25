import { useTimeEntriesPage } from "../../hooks/time/useTimeEntriesPage";
import { TimePageHeader } from "../../components/time/TimePageHeader";
import { TimerSection } from "../../components/time/TimerSection";
import { ManualEntryForm } from "../../components/time/ManualEntryForm";
import { ClockifyImportForm } from "../../components/time/ClockifyImportForm";
import { DateRangeFilter } from "../../components/time/DateRangeFilter";
import { EntryList } from "../../components/time/EntryList";

export function TimeEntriesPage() {
  const {
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
    projects,
    tags,
    workspaceId,
    showManual,
    setShowManual,
    showImport,
    setShowImport,
    totalSeconds,
    recentDescriptions,
  } = useTimeEntriesPage();

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <TimePageHeader
        workspaceId={workspaceId}
        showManual={showManual}
        showImport={showImport}
        onToggleManual={() => setShowManual((v) => !v)}
        onToggleImport={() => setShowImport((v) => !v)}
      />

      {showImport && workspaceId && (
        <ClockifyImportForm
          workspaceId={workspaceId}
          refetch={refetch}
          onClose={() => setShowImport(false)}
        />
      )}

      <TimerSection
        activeTimer={activeTimer}
        stopTimer={stopTimer}
        stopping={stopping}
        refetch={refetch}
        projects={projects}
        tags={tags}
        recentDescriptions={recentDescriptions}
      />

      {showManual && (
        <ManualEntryForm
          onClose={() => setShowManual(false)}
          recentDescriptions={recentDescriptions}
          tags={tags}
        />
      )}

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
        tags={tags}
        onResume={(entry) =>
          void startTimer({
            description: entry.description ?? undefined,
            projectId: entry.projectId ?? undefined,
            billable: entry.billable,
            tagIds: entry.tags.length ? entry.tags.map((t) => t.id) : undefined,
          })
        }
        onUpdate={(input) => void updateTimeEntry(input)}
      />
    </div>
  );
}
