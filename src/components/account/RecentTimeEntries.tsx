import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardTimeEntry } from "@/graphql/dashboard.operations";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

interface Props {
  entries: DashboardTimeEntry[];
}

export function RecentTimeEntries({ entries }: Props) {
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
                  <p className="text-xs text-muted-foreground">
                    {e.startTime.slice(0, 16).replace("T", " ")}
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
