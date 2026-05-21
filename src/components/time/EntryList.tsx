import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { TimeEntry } from "../../hooks/time/useTimeEntries";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface EntryListProps {
  entries: TimeEntry[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  deleteTimeEntry: (id: number) => Promise<unknown>;
}

export function EntryList({
  entries,
  loading,
  hasMore,
  loadMore,
  deleteTimeEntry,
}: EntryListProps) {
  if (loading) {
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
      <div className="flex flex-col gap-1">
        {entries.map((e) => (
          <div
            key={e.id}
            className="flex items-center justify-between text-sm py-2 border-b border-border"
          >
            <div>
              <p>
                {e.description ?? (
                  <span className="text-muted-foreground italic">
                    No description
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {e.startTime.slice(0, 16).replace("T", " ")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {e.billable && (
                <Badge variant="secondary" className="text-xs">
                  $
                </Badge>
              )}
              <span className="font-mono text-sm">
                {e.durationSeconds
                  ? formatDuration(e.durationSeconds)
                  : "running"}
              </span>
              <button
                className="text-muted-foreground hover:text-destructive text-xs"
                onClick={() => void deleteTimeEntry(e.id)}
                aria-label="Delete entry"
              >
                ✕
              </button>
            </div>
          </div>
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
