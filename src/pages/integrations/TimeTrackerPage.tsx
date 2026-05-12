import { useClockifyStatus } from "../../hooks/useClockify";
import { ConnectForm } from "../../components/clockify/ConnectForm";
import { WorkspacePicker } from "../../components/clockify/WorkspacePicker";
import { TrackerView } from "../../components/clockify/TrackerView";

export function TimeTrackerPage() {
  const { data: status, isLoading } = useClockifyStatus();

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <p className="text-sm text-zinc-500">Loading…</p>
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
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            Connect your Clockify account to start tracking time.
          </p>
          <ConnectForm />
        </>
      ) : !status.workspaceId ? (
        <>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            Choose a workspace to track time in.
          </p>
          <WorkspacePicker />
        </>
      ) : (
        <TrackerView workspaceId={status.workspaceId} />
      )}

      {status?.connected && (
        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <details className="text-xs text-zinc-400">
            <summary className="cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300">
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
