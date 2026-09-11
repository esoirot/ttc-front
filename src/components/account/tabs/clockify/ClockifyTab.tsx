import { useIntl } from "react-intl";
import {
  useClockifyStatus,
  useDisconnectClockify,
} from "@/hooks/integrations/useClockify";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ConnectForm } from "@/components/clockify/forms/ConnectForm";
import { WorkspacePicker } from "@/components/clockify/forms-inputs/WorkspacePicker";

export function ClockifyTab() {
  const intl = useIntl();
  const { data: status, isLoading } = useClockifyStatus();
  const disconnect = useDisconnectClockify();

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
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          {intl.formatMessage({
            id: "account.clockifyTab.connectPrompt",
            defaultMessage:
              "Connect your Clockify account to enable time tracking.",
          })}
        </p>
        <ConnectForm />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Badge
          variant="secondary"
          className="text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30"
        >
          {intl.formatMessage({
            id: "account.clockifyTab.connected",
            defaultMessage: "✓ Connected",
          })}
        </Badge>
        {status.workspaceId && (
          <span className="text-xs text-muted-foreground">
            {intl.formatMessage(
              {
                id: "account.clockifyTab.workspace",
                defaultMessage: "Workspace {workspaceId}",
              },
              { workspaceId: status.workspaceId },
            )}
          </span>
        )}
      </div>

      {!status.workspaceId && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            {intl.formatMessage({
              id: "account.clockifyTab.chooseWorkspace",
              defaultMessage: "Choose a workspace to use for time tracking.",
            })}
          </p>
          <WorkspacePicker />
        </div>
      )}

      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer hover:text-foreground transition-colors">
          {intl.formatMessage({
            id: "account.clockifyTab.updateApiKeyOrWorkspace",
            defaultMessage: "Update API key or workspace",
          })}
        </summary>
        <div className="mt-4 flex flex-col gap-6">
          <ConnectForm />
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              {intl.formatMessage({
                id: "account.clockifyTab.switchWorkspace",
                defaultMessage: "Switch workspace",
              })}
            </p>
            <WorkspacePicker />
          </div>
        </div>
      </details>

      <div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              disabled={disconnect.isPending}
            >
              {disconnect.isPending
                ? intl.formatMessage({
                    id: "account.clockifyTab.disconnecting",
                    defaultMessage: "Disconnecting…",
                  })
                : intl.formatMessage({
                    id: "account.clockifyTab.disconnectClockify",
                    defaultMessage: "Disconnect Clockify",
                  })}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {intl.formatMessage({
                  id: "account.clockifyTab.disconnectConfirmTitle",
                  defaultMessage: "Disconnect Clockify?",
                })}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {intl.formatMessage({
                  id: "account.clockifyTab.disconnectConfirmDescription",
                  defaultMessage:
                    "This will clear your API key and workspace. You will need to reconnect to resume imports.",
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {intl.formatMessage({
                  id: "common.actions.cancel",
                  defaultMessage: "Cancel",
                })}
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => void disconnect.mutateAsync()}
              >
                {intl.formatMessage({
                  id: "account.clockifyTab.disconnect",
                  defaultMessage: "Disconnect",
                })}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
