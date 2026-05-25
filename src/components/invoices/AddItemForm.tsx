import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRates } from "../../hooks/rates/useRates";
import { useTimeEntries } from "../../hooks/time/useTimeEntries";
import { secsToHms } from "../time/ttcHelpers";
import type { RateType } from "../../hooks/rates/useRates";
import type { TimeEntry } from "../../hooks/time/useTimeEntries";

const QTY_LABEL: Record<RateType, string> = {
  HOURLY: "Hours",
  PER_WORD: "Words",
  FIXED: "Qty",
};

type AddItemInput = {
  invoiceId: number;
  description: string;
  quantity: number;
  unitPrice: number;
  timeEntryId?: number;
};

type Props = {
  invoiceId: number;
  onAdd: (input: AddItemInput) => Promise<unknown>;
  loading: boolean;
  onClose: () => void;
};

function ManualTab({ invoiceId, onAdd, loading, onClose }: Props) {
  const [desc, setDesc] = useState("");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("0");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = parseFloat(qty);
    const p = parseFloat(price);
    if (!desc.trim() || isNaN(q) || isNaN(p)) return;
    await onAdd({
      invoiceId,
      description: desc.trim(),
      quantity: q,
      unitPrice: p,
    });
    setDesc("");
    setQty("1");
    setPrice("0");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="grid grid-cols-[1fr_80px_100px_auto] gap-2 items-end">
        <div className="flex flex-col gap-1">
          <Label htmlFor="m-desc" className="text-xs">
            Description
          </Label>
          <Input
            id="m-desc"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Description"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="m-qty" className="text-xs">
            Qty
          </Label>
          <Input
            id="m-qty"
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            min="0"
            step="1"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="m-price" className="text-xs">
            Unit price
          </Label>
          <Input
            id="m-price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0"
            step="0.01"
          />
        </div>
        <div className="flex gap-1">
          <Button type="submit" size="sm" disabled={loading}>
            Add
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>
      </div>
    </form>
  );
}

function FromRateTab({ invoiceId, onAdd, loading, onClose }: Props) {
  const { rates } = useRates();
  const [selectedRateId, setSelectedRateId] = useState<string>("");
  const [desc, setDesc] = useState("");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("0");

  const selectedRate = rates.find((r) => String(r.id) === selectedRateId);
  const qtyLabel = selectedRate ? QTY_LABEL[selectedRate.type] : "Qty";

  function handleRateSelect(rateId: string) {
    setSelectedRateId(rateId);
    const rate = rates.find((r) => String(r.id) === rateId);
    if (!rate) return;
    setDesc(rate.name);
    setPrice(String(rate.amount));
    if (rate.type === "FIXED") setQty("1");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = parseFloat(qty);
    const p = parseFloat(price);
    if (!desc.trim() || isNaN(q) || isNaN(p)) return;
    await onAdd({
      invoiceId,
      description: desc.trim(),
      quantity: q,
      unitPrice: p,
    });
    setSelectedRateId("");
    setDesc("");
    setQty("1");
    setPrice("0");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <Label className="text-xs">Rate</Label>
        <Select value={selectedRateId} onValueChange={handleRateSelect}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Pick a rate…" />
          </SelectTrigger>
          <SelectContent>
            {rates.map((r) => (
              <SelectItem key={r.id} value={String(r.id)}>
                {r.name} ({r.type}) — {r.amount} {r.currency}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-[1fr_80px_100px_auto] gap-2 items-end">
        <div className="flex flex-col gap-1">
          <Label htmlFor="r-desc" className="text-xs">
            Description
          </Label>
          <Input
            id="r-desc"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Description"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="r-qty" className="text-xs">
            {qtyLabel}
          </Label>
          <Input
            id="r-qty"
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            min="0"
            step="1"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="r-price" className="text-xs">
            Unit price
          </Label>
          <Input
            id="r-price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0"
            step="0.01"
          />
        </div>
        <div className="flex gap-1">
          <Button type="submit" size="sm" disabled={loading || !desc.trim()}>
            Add
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>
      </div>
    </form>
  );
}

function FromTimeTab({ invoiceId, onAdd, loading, onClose }: Props) {
  const { entries } = useTimeEntries();
  const billable = entries
    .filter(
      (e): e is TimeEntry & { durationSeconds: number } =>
        e.billable && e.durationSeconds != null,
    )
    .slice(0, 20);

  const [selected, setSelected] = useState<TimeEntry | null>(null);
  const [desc, setDesc] = useState("");
  const [qty, setQty] = useState("0");
  const [price, setPrice] = useState("0");

  function pickEntry(entry: TimeEntry & { durationSeconds: number }) {
    setSelected(entry);
    setDesc(entry.description ?? "Time entry");
    setQty((entry.durationSeconds / 3600).toFixed(2));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = parseFloat(qty);
    const p = parseFloat(price);
    if (!desc.trim() || isNaN(q) || isNaN(p)) return;
    await onAdd({
      invoiceId,
      description: desc.trim(),
      quantity: q,
      unitPrice: p,
      timeEntryId: selected?.id,
    });
    setSelected(null);
    setDesc("");
    setQty("0");
    setPrice("0");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <Label className="text-xs">Billable time entries</Label>
        {billable.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">
            No billable entries found.
          </p>
        ) : (
          <div className="border border-border rounded-md overflow-y-auto max-h-48">
            {billable.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => pickEntry(entry)}
                className={[
                  "w-full text-left px-3 py-2 text-sm flex justify-between items-center",
                  "hover:bg-accent border-b border-border last:border-0 cursor-pointer",
                  selected?.id === entry.id ? "bg-accent" : "",
                ].join(" ")}
              >
                <div className="flex flex-col min-w-0">
                  <span className="truncate font-medium">
                    {entry.description ?? (
                      <span className="text-muted-foreground italic">
                        No description
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {entry.startTime.slice(0, 10)}
                  </span>
                </div>
                <span className="text-xs font-mono text-muted-foreground ml-4 shrink-0">
                  {secsToHms(entry.durationSeconds)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-[1fr_80px_100px_auto] gap-2 items-end">
        <div className="flex flex-col gap-1">
          <Label htmlFor="t-desc" className="text-xs">
            Description
          </Label>
          <Input
            id="t-desc"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Description"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="t-qty" className="text-xs">
            Hours
          </Label>
          <Input
            id="t-qty"
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            min="0"
            step="0.01"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="t-price" className="text-xs">
            Unit price
          </Label>
          <Input
            id="t-price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0"
            step="0.01"
          />
        </div>
        <div className="flex gap-1">
          <Button type="submit" size="sm" disabled={loading || !desc.trim()}>
            Add
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>
      </div>
    </form>
  );
}

export function AddItemForm({ invoiceId, onAdd, loading, onClose }: Props) {
  return (
    <div className="mt-3 border border-border rounded-md p-3">
      <Tabs defaultValue="manual">
        <TabsList className="mb-3 h-7">
          <TabsTrigger value="manual" className="text-xs h-6">
            Manual
          </TabsTrigger>
          <TabsTrigger value="rate" className="text-xs h-6">
            From Rate
          </TabsTrigger>
          <TabsTrigger value="time" className="text-xs h-6">
            From Time Entry
          </TabsTrigger>
        </TabsList>
        <TabsContent value="manual" className="mt-0">
          <ManualTab
            invoiceId={invoiceId}
            onAdd={onAdd}
            loading={loading}
            onClose={onClose}
          />
        </TabsContent>
        <TabsContent value="rate" className="mt-0">
          <FromRateTab
            invoiceId={invoiceId}
            onAdd={onAdd}
            loading={loading}
            onClose={onClose}
          />
        </TabsContent>
        <TabsContent value="time" className="mt-0">
          <FromTimeTab
            invoiceId={invoiceId}
            onAdd={onAdd}
            loading={loading}
            onClose={onClose}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
