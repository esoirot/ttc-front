import { useAuditLog } from "../../hooks/integrations/useHubspot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function exportCsv<T extends Record<string, unknown>>(
  rows: T[],
  filename: string,
) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const lines = rows.map((r) =>
    headers.map((h) => JSON.stringify(r[h] ?? "")).join(","),
  );
  const blob = new Blob([[headers.join(","), ...lines].join("\n")], {
    type: "text/csv",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

const ACTION_VARIANT: Record<string, "default" | "secondary" | "destructive"> =
  {
    CREATE: "default",
    UPDATE: "secondary",
    DELETE: "destructive",
  };

export function AdminActivityLogPage() {
  const { data, isLoading, hasNextPage, fetchNextPage } = useAuditLog(
    undefined,
    50,
  );
  const entries = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold flex-1">Activity Log</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            exportCsv(
              entries.map((e) => ({
                id: e.id,
                user: e.user.email,
                action: e.action,
                resource: e.resource,
                createdAt: e.createdAt,
              })),
              "activity-log.csv",
            )
          }
        >
          Export CSV
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground py-8"
                  >
                    No activity yet.
                  </TableCell>
                </TableRow>
              )}
              {entries.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {new Date(e.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm">{e.user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={ACTION_VARIANT[e.action] ?? "secondary"}
                      className="text-xs"
                    >
                      {e.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-mono text-muted-foreground">
                    {e.resource}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {hasNextPage && (
        <Button
          variant="outline"
          className="mt-4 w-full"
          onClick={() => void fetchNextPage()}
        >
          Load more
        </Button>
      )}
    </div>
  );
}
