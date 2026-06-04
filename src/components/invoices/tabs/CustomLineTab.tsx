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

import type { CustomLineTabProps as Props } from "@/types/invoices.types";
import { useCustomLineTab } from "@/hooks/invoices/useCustomLineTab";
import { QTY_LABEL } from "@/constants/invoices";

export function CustomLineTab({ invoiceId, onAdd, adding }: Props) {
  const {
    rates,
    selectedRate,
    selectedRateId,
    desc,
    qty,
    price,
    setDesc,
    setQty,
    setPrice,
    handleRateSelect,
    handleAdd,
  } = useCustomLineTab(invoiceId, onAdd);

  const qtyLabel = selectedRate ? QTY_LABEL[selectedRate.type] : "Qty";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Label className="text-xs">Rate (optional)</Label>
        <Select value={selectedRateId} onValueChange={handleRateSelect}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Pick a rate to pre-fill…" />
          </SelectTrigger>
          <SelectContent>
            {rates.length === 0 ? (
              <SelectItem value="__none__" disabled>
                No rates — add rates first
              </SelectItem>
            ) : (
              rates.map((r) => (
                <SelectItem key={r.id} value={String(r.id)}>
                  {r.name} ({r.type}) — {r.amount} {r.currency}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-[1fr_80px_110px] gap-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor="cl-desc" className="text-xs">
            Description
          </Label>
          <Input
            id="cl-desc"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Description"
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleAdd();
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="cl-qty" className="text-xs">
            {qtyLabel}
          </Label>
          <Input
            id="cl-qty"
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            min="0"
            step="1"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="cl-price" className="text-xs">
            Unit price
          </Label>
          <Input
            id="cl-price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0"
            step="0.01"
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleAdd();
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-muted-foreground">
          {desc.trim() && price
            ? `Total: ${((parseFloat(qty) || 0) * (parseFloat(price) || 0)).toFixed(2)}`
            : ""}
        </span>
        <Button
          onClick={() => void handleAdd()}
          disabled={adding || !desc.trim()}
          size="sm"
        >
          {adding ? "Adding…" : "Add line"}
        </Button>
      </div>
    </div>
  );
}
