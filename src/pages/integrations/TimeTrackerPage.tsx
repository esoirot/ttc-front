import { useClockifyStatus } from "../../hooks/useClockify";
import { ConnectForm } from "../../components/clockify/ConnectForm";
import { WorkspacePicker } from "../../components/clockify/WorkspacePicker";
import { TrackerView } from "../../components/clockify/TrackerView";
import { Skeleton } from "@/components/ui/skeleton";

export function TimeTrackerPage() {
  const { data: status, isLoading } = useClockifyStatus();

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
      <h1 className="text-2xl font-semibold tracking-tight mb-6">
        Time Tracker
      </h1>

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

      {status?.connected && (
        <div className="mt-8 pt-6 border-t border-border">
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer hover:text-foreground transition-colors">
              Update API key or workspace
            </summary>
            <div className="mt-4">
              <ConnectForm />
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
