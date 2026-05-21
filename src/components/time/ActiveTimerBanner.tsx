import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useElapsedTimer } from "../../hooks/time/useElapsedTimer";
import type { TimeEntry } from "../../hooks/time/useTimeEntries";

interface ActiveTimerBannerProps {
  activeTimer: TimeEntry;
  stopTimer: () => Promise<unknown>;
  stopping: boolean;
  refetch: () => void;
}

export function ActiveTimerBanner({
  activeTimer,
  stopTimer,
  stopping,
  refetch,
}: ActiveTimerBannerProps) {
  const elapsed = useElapsedTimer(activeTimer.startTime);

  return (
    <Card className="mb-4 border-primary/30 bg-primary/5">
      <CardContent className="py-3 px-4 flex items-center justify-between">
        <div>
          <Badge variant="default" className="text-xs mb-1">
            Running
          </Badge>
          <p className="text-sm">
            {activeTimer.description ?? "No description"}
          </p>
          <p className="text-xs text-muted-foreground">
            Started {activeTimer.startTime.slice(0, 16).replace("T", " ")}
          </p>
          {elapsed && (
            <p className="font-mono text-lg font-semibold tabular-nums mt-1">
              {elapsed}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void stopTimer().then(() => refetch())}
          disabled={stopping}
        >
          {stopping ? "Stopping…" : "⏹ Stop"}
        </Button>
      </CardContent>
    </Card>
  );
}
