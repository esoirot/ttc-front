import {
  useHubspotStatus,
  useDisconnectHubspot,
} from "@/hooks/integrations/useHubspot";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { HUBSPOT_AUTH_URL } from "@/constants/hubspot";

export function HubspotTab() {
  const { data: status, isLoading } = useHubspotStatus();
  const disconnect = useDisconnectHubspot();

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
          Connect your HubSpot account to sync contacts, companies, and deals.
        </p>
        <Button
          type="button"
          onClick={() => {
            window.location.href = HUBSPOT_AUTH_URL;
          }}
        >
          Connect HubSpot
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
        {status.portalId && (
          <span className="text-xs text-muted-foreground">
            Portal {status.portalId}
          </span>
        )}
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
          {disconnect.isPending ? "Disconnecting…" : "Disconnect HubSpot"}
        </Button>
      </div>
    </div>
  );
}
