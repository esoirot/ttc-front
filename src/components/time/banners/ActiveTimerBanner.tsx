import { useIntl } from "react-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ActiveTimerBannerProps } from "@/types/time-entries.types";
import { useElapsedTimer } from "@/hooks/time/useElapsedTimer";

export function ActiveTimerBanner({
  activeTimer,
  stopTimer,
  stopping,
  refetch,
}: ActiveTimerBannerProps) {
  const intl = useIntl();
  const elapsed = useElapsedTimer(activeTimer.startTime);

  return (
    <Card className="mb-4 border-primary/30 bg-primary/5">
      <CardContent className="py-3 px-4 flex items-center justify-between">
        <div>
          <Badge variant="default" className="text-xs mb-1">
            {intl.formatMessage({
              id: "time.activeTimerBanner.running",
              defaultMessage: "Running",
            })}
          </Badge>
          <p className="text-sm">
            {activeTimer.description ??
              intl.formatMessage({
                id: "time.entryRow.noDescription",
                defaultMessage: "No description",
              })}
          </p>
          {activeTimer.tags.length > 0 && (
            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
              {activeTimer.tags.map((t) => (
                <Badge
                  key={t.id}
                  variant="secondary"
                  className="text-xs px-1.5 py-0"
                >
                  {t.name}
                </Badge>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {intl.formatMessage(
              {
                id: "time.activeTimerBanner.started",
                defaultMessage: "Started {timestamp}",
              },
              {
                timestamp: activeTimer.startTime.slice(0, 16).replace("T", " "),
              },
            )}
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
          {stopping
            ? intl.formatMessage({
                id: "time.activeTimerBanner.stopping",
                defaultMessage: "Stopping…",
              })
            : intl.formatMessage({
                id: "time.activeTimerBanner.stop",
                defaultMessage: "⏹ Stop",
              })}
        </Button>
      </CardContent>
    </Card>
  );
}
