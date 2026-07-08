import {
  useAdminTimeEntries,
  useAdminDeleteTimeEntry,
} from "@/hooks/admin/useAdminTimeEntries";
import { useBulkSelection } from "@/hooks/admin/useBulkSelection";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminPageHeader } from "../shared/AdminPageHeader";
import { BulkDeleteBar } from "../shared/BulkDeleteBar";
import { RowDeleteButton } from "../shared/RowDeleteButton";
import { ExportCsvButton } from "../shared/ExportCsvButton";
import {
  LoadMoreButton,
  TableEmptyRow,
  TableLoadingSkeleton,
} from "../shared/AdminTableChrome";
import { secsToHms } from "@/lib/time";

export function AdminTimeEntriesTable() {
  const { entries, loading, hasMore, loadMore, total } = useAdminTimeEntries();
  const { deleteEntry } = useAdminDeleteTimeEntry();
  const { selected, toggle, toggleAll, clear, isAllSelected } =
    useBulkSelection(entries.map((e) => e.id));

  const csvRows = entries.map((e) => ({
    id: e.id,
    owner: e.owner.email,
    projectId: e.projectId ?? "",
    description: e.description ?? "",
    startTime: e.startTime,
    duration: e.durationSeconds != null ? secsToHms(e.durationSeconds) : "",
    billable: e.billable,
  }));

  return (
    <>
      <AdminPageHeader title="Time Entries" total={total} />

      <div className="flex items-center gap-2 mb-4">
        <div className="ml-auto">
          <ExportCsvButton rows={csvRows} filename="time-entries.csv" />
        </div>
      </div>

      <BulkDeleteBar
        selectedIds={selected}
        itemLabel="entries"
        onDelete={deleteEntry}
        onDone={clear}
      />

      {loading && entries.length === 0 ? (
        <TableLoadingSkeleton rows={4} />
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">
                  <Checkbox
                    checked={entries.length > 0 && isAllSelected}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Billable</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 && (
                <TableEmptyRow colSpan={9}>
                  No time entries found.
                </TableEmptyRow>
              )}
              {entries.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(e.id)}
                      onCheckedChange={() => toggle(e.id)}
                    />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {e.id}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {e.owner.email}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {e.projectId ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm max-w-[160px] truncate">
                    {e.description ?? (
                      <span className="italic text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {e.startTime.slice(0, 16).replace("T", " ")}
                  </TableCell>
                  <TableCell className="text-xs font-mono">
                    {e.durationSeconds != null
                      ? secsToHms(e.durationSeconds)
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={e.billable ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {e.billable ? "$" : "—"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <RowDeleteButton
                      onDelete={() => deleteEntry(e.id)}
                      title="Delete time entry?"
                      description="This cannot be undone."
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {hasMore && <LoadMoreButton onClick={loadMore} />}
    </>
  );
}
