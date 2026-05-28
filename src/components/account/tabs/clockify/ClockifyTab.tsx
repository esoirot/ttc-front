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
          Connect your Clockify account to enable time tracking.
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
          ✓ Connected
        </Badge>
        {status.workspaceId && (
          <span className="text-xs text-muted-foreground">
            Workspace {status.workspaceId}
          </span>
        )}
      </div>

      {!status.workspaceId && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Choose a workspace to use for time tracking.
          </p>
          <WorkspacePicker />
        </div>
      )}

      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer hover:text-foreground transition-colors">
          Update API key or workspace
        </summary>
        <div className="mt-4 flex flex-col gap-6">
          <ConnectForm />
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">Switch workspace</p>
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
              {disconnect.isPending ? "Disconnecting…" : "Disconnect Clockify"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Disconnect Clockify?</AlertDialogTitle>
              <AlertDialogDescription>
                This will clear your API key and workspace. You will need to
                reconnect to resume imports.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => void disconnect.mutateAsync()}
              >
                Disconnect
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
