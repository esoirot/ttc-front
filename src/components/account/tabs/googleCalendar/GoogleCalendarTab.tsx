import {
  useGoogleCalendarStatus,
  useDisconnectGoogleCalendar,
} from "@/hooks/integrations/useGoogleCalendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GOOGLE_CALENDAR_AUTH_URL } from "@/constants/googleCalendar";

export function GoogleCalendarTab() {
  const { data: status, isLoading } = useGoogleCalendarStatus();
  const disconnect = useDisconnectGoogleCalendar();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  if (!status?.connected) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-sm text-muted-foreground">
          Connect your Google account to see your events on the dashboard and
          create new ones.
        </p>
        <Button
          type="button"
          onClick={() => {
            window.location.href = GOOGLE_CALENDAR_AUTH_URL;
          }}
        >
          Connect Google Calendar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Badge
          variant="secondary"
          className="text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30"
        >
          ✓ Connected
        </Badge>
        <span className="text-xs text-muted-foreground">
          {status.email ?? "—"}
        </span>
      </div>
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => void disconnect.mutateAsync()}
          disabled={disconnect.isPending}
        >
          {disconnect.isPending
            ? "Disconnecting…"
            : "Disconnect Google Calendar"}
        </Button>
      </div>
    </div>
  );
}
