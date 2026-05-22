import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { TimeEntry } from "../../hooks/time/useTimeEntries";
import type { Project } from "../../hooks/projects/useProjects";
import { groupByDay } from "./ttcHelpers";
import { TtcDayGroup } from "./TtcDayGroup";
import type { TtcUpdateInput } from "./TtcEntryRow";

interface EntryListProps {
  entries: TimeEntry[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  deleteTimeEntry: (id: number) => Promise<unknown>;
  projects: Project[];
  onResume: (entry: TimeEntry) => void;
  onUpdate: (input: TtcUpdateInput) => void;
}

export function EntryList({
  entries,
  loading,
  hasMore,
  loadMore,
  deleteTimeEntry,
  projects,
  onResume,
  onUpdate,
}: EntryListProps) {
  if (loading && entries.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No entries in this period.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {groupByDay(entries).map(([dayKey, dayEntries]) => (
          <TtcDayGroup
            key={dayKey}
            dayKey={dayKey}
            entries={dayEntries}
            projects={projects}
            onDelete={(id) => void deleteTimeEntry(id)}
            onResume={onResume}
            onUpdate={onUpdate}
          />
        ))}
      </div>
      {hasMore && (
        <Button
          variant="outline"
          className="mt-4 w-full"
          onClick={loadMore}
          disabled={false}
        >
          Load more
        </Button>
      )}
    </>
  );
}
