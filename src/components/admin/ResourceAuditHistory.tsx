import { useAuditLog } from "../../hooks/integrations/useHubspot";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  open: boolean;
  onClose: () => void;
  resourceName: string;
}

const ACTION_VARIANT: Record<string, "default" | "secondary" | "destructive"> =
  {
    CREATE: "default",
    UPDATE: "secondary",
    DELETE: "destructive",
  };

export function ResourceAuditHistory({ open, onClose, resourceName }: Props) {
  const { data, isLoading, hasNextPage, fetchNextPage } = useAuditLog(
    undefined,
    20,
  );
  const entries = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>History — {resourceName}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No history found.
            </p>
          ) : (
            <div className="flex flex-col gap-0">
              {entries.map((entry, idx) => (
                <div
                  key={entry.id}
                  className="flex gap-3 py-2.5 border-b border-border last:border-0"
                >
                  {/* timeline dot */}
                  <div className="flex flex-col items-center shrink-0 pt-1">
                    <div className="w-2 h-2 rounded-full bg-primary mt-0.5" />
                    {idx < entries.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant={ACTION_VARIANT[entry.action] ?? "secondary"}
                        className="text-xs px-1.5"
                      >
                        {entry.action}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">
                        {entry.resource}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {entry.user.email} ·{" "}
                      {new Date(entry.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {hasNextPage && (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => void fetchNextPage()}
            >
              Load more
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
