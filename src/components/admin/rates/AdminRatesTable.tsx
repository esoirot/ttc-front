import { useState } from "react";
import { useAdminRates, useAdminCrudRates } from "@/hooks/admin/useAdminRates";
import { useBulkSelection } from "@/hooks/admin/useBulkSelection";
import type { AdminRate } from "@/types/admin.types";
import type { TranslationRateType } from "@/types/rates.types";
import { Button } from "@/components/ui/button";
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
import { RateForm } from "./RateForm";
import { TRANSLATION_RATE_TYPES as RATE_TYPES } from "@/constants/rates";
import { ADMIN_EMPTY_RATE_FORM } from "@/constants/admin";
import { ResourceAuditHistory } from "../audits/ResourceAuditHistory";
import { AdminPageHeader } from "../shared/AdminPageHeader";
import { BulkDeleteBar } from "../shared/BulkDeleteBar";
import { RowDeleteButton } from "../shared/RowDeleteButton";
import { ExportCsvButton } from "../shared/ExportCsvButton";
import {
  TableEmptyRow,
  TableLoadingSkeleton,
} from "../shared/AdminTableChrome";

export function AdminRatesTable() {
  const [typeFilter, setTypeFilter] = useState<TranslationRateType | "ALL">(
    "ALL",
  );
  const { rates, loading, total } = useAdminRates(
    typeFilter !== "ALL" ? typeFilter : undefined,
  );
  const { createRate, updateRate, deleteRate } = useAdminCrudRates();

  const { selected, toggle, toggleAll, clear, isAllSelected } =
    useBulkSelection(rates.map((r) => r.id));
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminRate | null>(null);
  const [historyTarget, setHistoryTarget] = useState<AdminRate | null>(null);
  const [form, setForm] = useState(ADMIN_EMPTY_RATE_FORM);

  function openCreate() {
    setForm(ADMIN_EMPTY_RATE_FORM);
    setCreateOpen(true);
  }

  function openEdit(r: AdminRate) {
    setForm({
      name: r.name,
      type: r.type,
      amount: r.amount.toString(),
      currency: r.currency,
      description: r.description ?? "",
      activityId: r.activityId?.toString() ?? "",
    });
    setEditTarget(r);
  }

  const csvRows = rates.map((r) => ({
    id: r.id,
    owner: r.owner.email,
    type: r.type,
    name: r.name,
    amount: r.amount,
    currency: r.currency,
    created: r.createdAt.slice(0, 10),
  }));

  return (
    <>
      <AdminPageHeader title="Rates" total={total} />

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as TranslationRateType | "ALL")}
        >
          <SelectTrigger className="w-36 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All types</SelectItem>
            {RATE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto flex gap-2">
          <ExportCsvButton rows={csvRows} filename="rates.csv" />
          <Button size="sm" onClick={openCreate}>
            + New Rate
          </Button>
        </div>
      </div>

      <BulkDeleteBar
        selectedIds={selected}
        itemLabel="rates"
        onDelete={deleteRate}
        onDone={clear}
      />

      {loading ? (
        <TableLoadingSkeleton />
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">
                  <Checkbox
                    checked={rates.length > 0 && isAllSelected}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Created</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rates.length === 0 && (
                <TableEmptyRow colSpan={9}>No rates found.</TableEmptyRow>
              )}
              {rates.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(r.id)}
                      onCheckedChange={() => toggle(r.id)}
                    />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {r.id}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {r.name}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {r.owner.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs font-mono">
                      {r.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-mono">
                    {r.type === "PER_WORD"
                      ? r.amount.toFixed(4)
                      : r.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {r.currency}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {r.createdAt.slice(0, 10)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 justify-end">
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => openEdit(r)}
                        aria-label="Edit"
                      >
                        ✎
                      </Button>
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => setHistoryTarget(r)}
                        aria-label="History"
                      >
                        🕐
                      </Button>
                      <RowDeleteButton
                        onDelete={() => deleteRate(r.id)}
                        title="Delete rate?"
                        description={
                          <>
                            Delete <strong>{r.name}</strong>? This cannot be
                            undone.
                          </>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={createOpen}
        onOpenChange={(v) => !v && setCreateOpen(false)}
      >
        <DialogContent className="max-w-sm" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>New Rate</DialogTitle>
          </DialogHeader>
          <RateForm form={form} onChange={setForm} />
          <div className="flex gap-2 justify-end mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                void createRate({
                  userId: 0,
                  type: form.type,
                  name: form.name,
                  amount: Number(form.amount),
                  currency: form.currency,
                  description: form.description || undefined,
                  activityId: Number(form.activityId),
                });
                setCreateOpen(false);
              }}
              disabled={!form.name || !form.amount || !form.activityId}
            >
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editTarget}
        onOpenChange={(v) => !v && setEditTarget(null)}
      >
        <DialogContent className="max-w-sm" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Edit Rate — {editTarget?.name}</DialogTitle>
          </DialogHeader>
          <RateForm form={form} onChange={setForm} />
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
                  void updateRate({
                    id: editTarget.id,
                    name: form.name,
                    amount: Number(form.amount),
                    currency: form.currency,
                    description: form.description || undefined,
                    activityId: form.activityId
                      ? Number(form.activityId)
                      : undefined,
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
          resourceName={historyTarget.name}
        />
      )}
    </>
  );
}
