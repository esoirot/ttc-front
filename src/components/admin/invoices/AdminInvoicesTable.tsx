import { useState } from "react";
import {
  useAdminInvoices,
  useAdminCrudInvoices,
} from "@/hooks/admin/useAdminInvoices";
import { useBulkSelection } from "@/hooks/admin/useBulkSelection";
import type { AdminInvoice } from "@/types/admin.types";
import type { InvoiceStatus } from "@/types/invoices.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ADMIN_INVOICE_STATUS_BADGE,
  INVOICE_STATUSES,
} from "@/constants/admin";
import { ResourceAuditHistory } from "../audits/ResourceAuditHistory";
import { AdminPageHeader } from "../shared/AdminPageHeader";
import { BulkDeleteBar } from "../shared/BulkDeleteBar";
import { RowDeleteButton } from "../shared/RowDeleteButton";
import { ExportCsvButton } from "../shared/ExportCsvButton";
import {
  LoadMoreButton,
  TableEmptyRow,
  TableLoadingSkeleton,
} from "../shared/AdminTableChrome";

export function AdminInvoicesTable() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "ALL">(
    "ALL",
  );
  const { invoices, loading, hasMore, loadMore, total } = useAdminInvoices(
    statusFilter !== "ALL" ? statusFilter : undefined,
    search || undefined,
  );
  const { updateInvoice, deleteInvoice } = useAdminCrudInvoices();

  const { selected, toggle, toggleAll, clear, isAllSelected } =
    useBulkSelection(invoices.map((i) => i.id));
  const [editTarget, setEditTarget] = useState<AdminInvoice | null>(null);
  const [historyTarget, setHistoryTarget] = useState<AdminInvoice | null>(null);
  const [editForm, setEditForm] = useState({
    status: "DRAFT" as InvoiceStatus,
    notes: "",
    dueDate: "",
  });

  function openEdit(inv: AdminInvoice) {
    setEditForm({
      status: inv.status,
      notes: inv.notes ?? "",
      dueDate: inv.dueDate ?? "",
    });
    setEditTarget(inv);
  }

  const csvRows = invoices.map((inv) => ({
    id: inv.id,
    owner: inv.owner.email,
    number: inv.number,
    status: inv.status,
    currency: inv.currency,
    total: inv.items.reduce((s, i) => s + i.total, 0).toFixed(2),
    created: inv.createdAt.slice(0, 10),
  }));

  return (
    <>
      <AdminPageHeader title="Invoices" total={total} />

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Input
          placeholder="Search number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs h-8 text-sm"
        />
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as InvoiceStatus | "ALL")}
        >
          <SelectTrigger className="w-36 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {INVOICE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <ExportCsvButton rows={csvRows} filename="invoices.csv" />
        </div>
      </div>

      <BulkDeleteBar
        selectedIds={selected}
        itemLabel="invoices"
        onDelete={deleteInvoice}
        onDone={clear}
      />

      {loading && invoices.length === 0 ? (
        <TableLoadingSkeleton rows={4} />
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">
                  <Checkbox
                    checked={invoices.length > 0 && isAllSelected}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Number</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Created</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 && (
                <TableEmptyRow colSpan={9}>No invoices found.</TableEmptyRow>
              )}
              {invoices.map((inv) => {
                const total = inv.items.reduce((s, i) => s + i.total, 0);
                return (
                  <TableRow key={inv.id}>
                    <TableCell>
                      <Checkbox
                        checked={selected.has(inv.id)}
                        onCheckedChange={() => toggle(inv.id)}
                      />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {inv.id}
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      {inv.number}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {inv.owner.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={ADMIN_INVOICE_STATUS_BADGE[inv.status]}
                        className="text-xs"
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      {total.toFixed(2)} {inv.currency}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {inv.dueDate?.slice(0, 10) ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {inv.createdAt.slice(0, 10)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => openEdit(inv)}
                          aria-label="Edit"
                        >
                          ✎
                        </Button>
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => setHistoryTarget(inv)}
                          aria-label="History"
                        >
                          🕐
                        </Button>
                        <RowDeleteButton
                          onDelete={() => deleteInvoice(inv.id)}
                          title="Delete invoice?"
                          description={
                            <>
                              Delete <strong>{inv.number}</strong>? This cannot
                              be undone.
                            </>
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      {hasMore && <LoadMoreButton onClick={loadMore} />}

      <Dialog
        open={!!editTarget}
        onOpenChange={(v) => !v && setEditTarget(null)}
      >
        <DialogContent className="max-w-sm" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Edit Invoice — {editTarget?.number}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div>
              <Label>Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(v) =>
                  setEditForm({ ...editForm, status: v as InvoiceStatus })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVOICE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Due date</Label>
              <Input
                className="mt-1"
                type="date"
                value={editForm.dueDate}
                onChange={(e) =>
                  setEditForm({ ...editForm, dueDate: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Input
                className="mt-1"
                value={editForm.notes}
                onChange={(e) =>
                  setEditForm({ ...editForm, notes: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditTarget(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (editTarget)
                  void updateInvoice({
                    id: editTarget.id,
                    status: editForm.status,
                    notes: editForm.notes || undefined,
                    dueDate: editForm.dueDate || undefined,
                  });
                setEditTarget(null);
              }}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {historyTarget && (
        <ResourceAuditHistory
          open={!!historyTarget}
          onClose={() => setHistoryTarget(null)}
          resourceName={historyTarget.number}
        />
      )}
    </>
  );
}
