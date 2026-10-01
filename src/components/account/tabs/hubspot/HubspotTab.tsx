import { useIntl } from "react-intl";
import {
  useHubspotStatus,
  useDisconnectHubspot,
} from "@/hooks/integrations/useHubspot";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { HUBSPOT_AUTH_URL } from "@/constants/hubspot";
import { redirectTo } from "@/lib/navigation";

export function HubspotTab() {
  const intl = useIntl();
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
          {intl.formatMessage({
            id: "account.hubspotTab.connectPrompt",
            defaultMessage:
              "Connect your HubSpot account to sync contacts, companies, and deals.",
          })}
        </p>
        <Button
          type="button"
          onClick={() => {
            redirectTo(HUBSPOT_AUTH_URL);
          }}
        >
          {intl.formatMessage({
            id: "account.hubspotTab.connectHubspot",
            defaultMessage: "Connect HubSpot",
          })}
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
          {intl.formatMessage({
            id: "account.hubspotTab.connected",
            defaultMessage: "✓ Connected",
          })}
        </Badge>
        {status.portalId && (
          <span className="text-xs text-muted-foreground">
            {intl.formatMessage(
              {
                id: "account.hubspotTab.portal",
                defaultMessage: "Portal {portalId}",
              },
              { portalId: status.portalId },
            )}
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
          {disconnect.isPending
            ? intl.formatMessage({
                id: "account.hubspotTab.disconnecting",
                defaultMessage: "Disconnecting…",
              })
            : intl.formatMessage({
                id: "account.hubspotTab.disconnectHubspot",
                defaultMessage: "Disconnect HubSpot",
              })}
        </Button>
      </div>
    </div>
  );
}
