import { useState } from "react";
import {
  useAdminRates,
  useAdminCrudRates,
} from "../../hooks/admin/useAdminRates";
import type { AdminRate } from "@/types/admin.types";
import type { RateType } from "@/types/rates.types";
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
import { ResourceAuditHistory } from "../../components/admin/ResourceAuditHistory";

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

const RATE_TYPES: RateType[] = ["HOURLY", "PER_WORD", "FIXED"];
const CURRENCIES = ["EUR", "USD", "GBP", "CHF", "CAD", "AUD", "JPY"];

const EMPTY_FORM = {
  name: "",
  type: "HOURLY" as RateType,
  amount: "",
  currency: "EUR",
  description: "",
};

export function AdminRatesPage() {
  const [typeFilter, setTypeFilter] = useState<RateType | "ALL">("ALL");
  const { rates, loading, total } = useAdminRates(
    typeFilter !== "ALL" ? typeFilter : undefined,
  );
  const { createRate, updateRate, deleteRate } = useAdminCrudRates();

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminRate | null>(null);
  const [historyTarget, setHistoryTarget] = useState<AdminRate | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function openCreate() {
    setForm(EMPTY_FORM);
    setCreateOpen(true);
  }

  function openEdit(r: AdminRate) {
    setForm({
      name: r.name,
      type: r.type,
      amount: r.amount.toString(),
      currency: r.currency,
      description: r.description ?? "",
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
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold flex-1">Rates</h1>
        <span className="text-sm text-muted-foreground">{total} total</span>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as RateType | "ALL")}
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportCsv(csvRows, "rates.csv")}
          >
            Export CSV
          </Button>
          <Button size="sm" onClick={openCreate}>
            + New Rate
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
                  Delete {selected.size} rates?
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
                    selected.forEach((id) => void deleteRate(id));
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

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
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
                    checked={rates.length > 0 && selected.size === rates.length}
                    onCheckedChange={() =>
                      setSelected(
                        selected.size === rates.length
                          ? new Set()
                          : new Set(rates.map((r) => r.id)),
                      )
                    }
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
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-muted-foreground py-8"
                  >
                    No rates found.
                  </TableCell>
                </TableRow>
              )}
              {rates.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(r.id)}
                      onCheckedChange={() => toggleSelect(r.id)}
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
                            <AlertDialogTitle>Delete rate?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Delete <strong>{r.name}</strong>? This cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => void deleteRate(r.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create dialog */}
      <Dialog
        open={createOpen}
        onOpenChange={(v) => !v && setCreateOpen(false)}
      >
        <DialogContent className="max-w-sm">
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
                });
                setCreateOpen(false);
              }}
              disabled={!form.name || !form.amount}
            >
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(v) => !v && setEditTarget(null)}
      >
        <DialogContent className="max-w-sm">
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
    </div>
  );
}

function RateForm({
  form,
  onChange,
}: {
  form: {
    name: string;
    type: RateType;
    amount: string;
    currency: string;
    description: string;
  };
  onChange: (f: typeof form) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <Label>Name *</Label>
        <Input
          className="mt-1"
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
        />
      </div>
      <div>
        <Label>Type</Label>
        <Select
          value={form.type}
          onValueChange={(v) => onChange({ ...form, type: v as RateType })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["HOURLY", "PER_WORD", "FIXED"].map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Amount *</Label>
          <Input
            className="mt-1"
            type="number"
            step="0.0001"
            value={form.amount}
            onChange={(e) => onChange({ ...form, amount: e.target.value })}
          />
        </div>
        <div>
          <Label>Currency</Label>
          <Select
            value={form.currency}
            onValueChange={(v) => onChange({ ...form, currency: v })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Description</Label>
        <Input
          className="mt-1"
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
        />
      </div>
    </div>
  );
}
