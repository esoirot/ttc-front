import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  invoiceId: number;
  onAdd: (input: {
    invoiceId: number;
    description: string;
    quantity: number;
    unitPrice: number;
  }) => Promise<unknown>;
  loading: boolean;
  onClose: () => void;
};

export function AddItemForm({ invoiceId, onAdd, loading, onClose }: Props) {
  const [desc, setDesc] = useState("");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("0");

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
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
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
      <div className="grid grid-cols-[1fr_80px_100px_auto] gap-2 items-end">
        <div className="flex flex-col gap-1">
          <Label htmlFor="ai-desc" className="text-xs">
            Description
          </Label>
          <Input
            id="ai-desc"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Description"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="ai-qty" className="text-xs">
            Qty
          </Label>
          <Input
            id="ai-qty"
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            min="0"
            step="0.01"
            placeholder="Qty"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="ai-price" className="text-xs">
            Unit price
          </Label>
          <Input
            id="ai-price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0"
            step="0.01"
            placeholder="Price"
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
