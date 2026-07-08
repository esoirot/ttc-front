import { useGoogleCalendarStatus } from "@/hooks/integrations/useGoogleCalendar";
import { Skeleton } from "@/components/ui/skeleton";
import { ConnectedView } from "./views/ConnectedView";
import { SetupView } from "./views/SetupView";

export function GoogleCalendarIntegration() {
  const { data: status, isLoading } = useGoogleCalendarStatus();

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-4 w-48" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-xl font-semibold mb-6">Google Calendar</h1>
      {status?.connected ? <ConnectedView /> : <SetupView />}
    </div>
  );
}
