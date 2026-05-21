import { useAuditLog } from "@/hooks/integrations/useHubspot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function AuditTable() {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useAuditLog();
  const entries = data?.pages.flatMap((p) => p.items) ?? [];

  if (isLoading)
    return (
      <div className="flex flex-col gap-2 mt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    );

  return (
    <>
      <table className="w-full mt-4">
        <thead>
          <tr className="border-b border-border">
            <th className="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Time
            </th>
            <th className="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
              User
            </th>
            <th className="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Action
            </th>
            <th className="pb-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Resource
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="py-8 text-center text-sm text-muted-foreground"
              >
                No audit entries yet
              </td>
            </tr>
          )}
          {entries.map((e) => (
            <tr key={e.id} className="border-b border-border">
              <td className="py-2.5 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                {new Date(e.createdAt).toLocaleString()}
              </td>
              <td className="py-2.5 pr-4 text-sm">{e.user.email}</td>
              <td className="py-2.5 pr-4">
                <Badge variant="secondary" className="text-xs font-mono">
                  {e.action}
                </Badge>
              </td>
              <td className="py-2.5 text-xs text-muted-foreground font-mono">
                {e.resource}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {hasNextPage && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          disabled={isFetchingNextPage}
          onClick={() => void fetchNextPage()}
        >
          {isFetchingNextPage ? "Loading…" : "Load more"}
        </Button>
      )}
    </>
  );
}
