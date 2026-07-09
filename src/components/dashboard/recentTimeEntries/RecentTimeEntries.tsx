import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableTimeField } from "@/components/time/EditableTimeField";
import { useUpdateTimeEntry } from "@/hooks/time/useTimeEntries";
import type {
  DashboardTimeEntry,
  RecentTimeEntriesProps as Props,
} from "@/types/dashboard.types";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function RecentTimeEntries({ entries }: Props) {
  const queryClient = useQueryClient();
  const { updateTimeEntry } = useUpdateTimeEntry();

  function commitStartTime(id: number, newIso: string) {
    void updateTimeEntry({ id, startTime: newIso }).then(() => {
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Recent Time Entries</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No time entries yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {entries.map((e: DashboardTimeEntry) => (
              <div
                key={e.id}
                className="flex items-center justify-between py-1 border-b border-border last:border-0"
              >
                <div>
                  <p className="text-sm">
                    {e.description ?? (
                      <span className="italic text-muted-foreground">
                        No description
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span>{e.startTime.slice(0, 10)}</span>
                    <EditableTimeField
                      iso={e.startTime}
                      label="start time"
                      onCommit={(newIso) => commitStartTime(e.id, newIso)}
                    />
                  </p>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  {e.durationSeconds
                    ? formatDuration(e.durationSeconds)
                    : "running"}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
