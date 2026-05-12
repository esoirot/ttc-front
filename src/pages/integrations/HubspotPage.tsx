import { useHubspotStatus } from "../../hooks/useHubspot";
import { SetupView } from "../../components/hubspot/SetupView";
import { ConnectedView } from "../../components/hubspot/ConnectedView";

export function HubspotPage() {
  const { data: status, isLoading } = useHubspotStatus();

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8 text-sm text-zinc-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-white mb-6">
        HubSpot
      </h1>
      {status?.connected ? (
        <ConnectedView portalId={status.portalId} />
      ) : (
        <SetupView />
      )}
    </div>
  );
}
