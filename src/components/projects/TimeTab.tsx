import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { TimeEntry } from "../../hooks/time/useTimeEntries";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface TimeTabProps {
  projectId: number;
  entries: TimeEntry[];
  entriesLoading: boolean;
  activeTimer: TimeEntry | null | undefined;
  startTimer: (input: { projectId: number }) => Promise<unknown>;
  stopTimer: () => Promise<unknown>;
  starting: boolean;
  stopping: boolean;
}

export function TimeTab({
  projectId,
  entries,
  entriesLoading,
  activeTimer,
  startTimer,
  stopTimer,
  starting,
  stopping,
}: TimeTabProps) {
  const isTimerForThisProject = activeTimer?.projectId === projectId;

  return (
    <>
      <div className="mb-4">
        {isTimerForThisProject ? (
          <Button
            variant="outline"
            onClick={() => void stopTimer()}
            disabled={stopping}
          >
            {stopping ? "Stopping…" : "⏹ Stop timer"}
          </Button>
        ) : (
          <Button
            onClick={() => void startTimer({ projectId })}
            disabled={starting}
          >
            {starting ? "Starting…" : "▶ Start timer"}
          </Button>
        )}
      </div>

      {entriesLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : entries.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No time entries for this project.
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          {entries.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between text-sm py-1 border-b border-border"
            >
              <span className="text-muted-foreground">
                {e.description ?? "—"}
              </span>
              <div className="flex items-center gap-3">
                <span>{e.startTime.slice(0, 16).replace("T", " ")}</span>
                <span className="font-mono">
                  {e.durationSeconds
                    ? formatDuration(e.durationSeconds)
                    : "running"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
