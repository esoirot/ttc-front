import {
  useHubspotAdminConnections,
  useForceDisconnectHubspot,
} from "@/hooks/integrations/useHubspot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function ConnectionsTable() {
  const { data, isLoading } = useHubspotAdminConnections();
  const forceDisconnect = useForceDisconnectHubspot();

  if (isLoading)
    return (
      <div className="flex flex-col gap-2 mt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    );

  const connections = data ?? [];

  return (
    <table className="w-full mt-4">
      <thead>
        <tr className="border-b border-border">
          <th className="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
            User
          </th>
          <th className="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Status
          </th>
          <th className="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Portal ID
          </th>
          <th className="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Token expires
          </th>
          <th className="pb-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide" />
        </tr>
      </thead>
      <tbody>
        {connections.length === 0 && (
          <tr>
            <td
              colSpan={5}
              className="py-8 text-center text-sm text-muted-foreground"
            >
              No HubSpot connections
            </td>
          </tr>
        )}
        {connections.map((c) => (
          <tr key={c.userId} className="border-b border-border">
            <td className="py-2.5 pr-4 text-sm">{c.email}</td>
            <td className="py-2.5 pr-4">
              <Badge variant={c.connected ? "default" : "secondary"}>
                {c.connected ? "Connected" : "Disconnected"}
              </Badge>
            </td>
            <td className="py-2.5 pr-4 text-sm text-muted-foreground">
              {c.portalId ?? "—"}
            </td>
            <td className="py-2.5 pr-4 text-xs text-muted-foreground">
              {c.expiresAt ? new Date(c.expiresAt).toLocaleString() : "—"}
            </td>
            <td className="py-2.5 text-right">
              {c.connected && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  disabled={forceDisconnect.isPending}
                  onClick={() => void forceDisconnect.mutateAsync(c.userId)}
                >
                  Disconnect
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
