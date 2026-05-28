import {
  useClockifyStatus,
  useClockifyWorkspaces,
} from "@/hooks/integrations/useClockify";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ConnectForm } from "./forms/ConnectForm";
import { TrackerView } from "./views/TrackerView";
import { WorkspacePicker } from "./forms-inputs/WorkspacePicker";

export function ClockifyTracker() {
  const { data: status, isLoading } = useClockifyStatus();
  const { data: workspaces = [] } = useClockifyWorkspaces(
    status?.connected ?? false,
  );

  const plan = status?.workspaceId
    ? (workspaces.find((w) => w.id === status.workspaceId)
        ?.featureSubscriptionType ?? null)
    : null;

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Skeleton className="h-8 w-36 mb-6" />
        <Skeleton className="h-4 w-64" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Time Tracker</h1>
        {plan && (
          <Badge variant="secondary" className="text-xs font-mono">
            {plan}
          </Badge>
        )}
      </div>

      {!status?.connected ? (
        <>
          <p className="text-sm text-muted-foreground mb-6">
            Connect your Clockify account to start tracking time.
          </p>
          <ConnectForm />
        </>
      ) : !status.workspaceId ? (
        <>
          <p className="text-sm text-muted-foreground mb-6">
            Choose a workspace to track time in.
          </p>
          <WorkspacePicker />
        </>
      ) : (
        <TrackerView workspaceId={status.workspaceId} />
      )}
    </div>
  );
}
