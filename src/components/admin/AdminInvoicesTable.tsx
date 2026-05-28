import { useState } from "react";
import {
  useAdminInvoices,
  useAdminCrudInvoices,
} from "@/hooks/admin/useAdminInvoices";
import type { AdminInvoice } from "@/types/admin.types";
import type { InvoiceStatus } from "@/types/invoices.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { ResourceAuditHistory } from "./ResourceAuditHistory";
import { exportCsv } from "@/lib/csv";
import {
  ADMIN_INVOICE_STATUS_BADGE,
  INVOICE_STATUSES,
} from "@/constants/admin";

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

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [editTarget, setEditTarget] = useState<AdminInvoice | null>(null);
  const [historyTarget, setHistoryTarget] = useState<AdminInvoice | null>(null);
  const [editForm, setEditForm] = useState({
    status: "DRAFT" as InvoiceStatus,
    notes: "",
    dueDate: "",
  });

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

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
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold flex-1">Invoices</h1>
        <span className="text-sm text-muted-foreground">{total} total</span>
      </div>

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
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportCsv(csvRows, "invoices.csv")}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-muted rounded text-sm">
          <span className="text-muted-foreground">
            {selected.size} selected
          </span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive" className="ml-auto h-7">
                Delete selected ({selected.size})
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete {selected.size} invoices?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => {
                    selected.forEach((id) => void deleteInvoice(id));
                    setSelected(new Set());
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {loading && invoices.length === 0 ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">
                  <Checkbox
                    checked={
                      invoices.length > 0 && selected.size === invoices.length
                    }
                    onCheckedChange={() =>
                      setSelected(
                        selected.size === invoices.length
                          ? new Set()
                          : new Set(invoices.map((i) => i.id)),
                      )
                    }
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
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-muted-foreground py-8"
                  >
                    No invoices found.
                  </TableCell>
                </TableRow>
              )}
              {invoices.map((inv) => {
                const total = inv.items.reduce((s, i) => s + i.total, 0);
                return (
                  <TableRow key={inv.id}>
                    <TableCell>
                      <Checkbox
                        checked={selected.has(inv.id)}
                        onCheckedChange={() => toggleSelect(inv.id)}
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
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon-xs"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              aria-label="Delete"
                            >
                              ✕
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete invoice?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Delete <strong>{inv.number}</strong>? This
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => void deleteInvoice(inv.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      {hasMore && (
        <Button variant="outline" className="mt-4 w-full" onClick={loadMore}>
          Load more
        </Button>
      )}

      <Dialog
        open={!!editTarget}
        onOpenChange={(v) => !v && setEditTarget(null)}
      >
        <DialogContent className="max-w-sm">
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
