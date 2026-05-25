import type { TimeTabProps } from "@/types/projects.types";
import { TimerSection } from "../time/TimerSection";
import { EntryList } from "../time/EntryList";

export function TimeTab({
  projectId,
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
  recentDescriptions,
  handleResume,
}: TimeTabProps) {
  return (
    <>
      <TimerSection
        activeTimer={activeTimer}
        stopTimer={stopTimer}
        stopping={stopping}
        refetch={refetch}
        projects={projects}
        tags={tags}
        recentDescriptions={recentDescriptions}
        initialProjectId={projectId}
      />
      <EntryList
        entries={entries}
        loading={loading}
        hasMore={hasMore}
        loadMore={loadMore}
        deleteTimeEntry={deleteTimeEntry}
        projects={projects}
        tags={tags}
        onResume={handleResume}
        onUpdate={updateTimeEntry}
      />
    </>
  );
}
