import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { InvoiceItem } from "../../hooks/invoices/useInvoices";

type EditState = { desc: string; qty: string; price: string };

type Props = {
  item: InvoiceItem;
  editing: boolean;
  editState: EditState;
  onStartEdit: () => void;
  onChangeDesc: (v: string) => void;
  onChangeQty: (v: string) => void;
  onChangePrice: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onRemove: () => void;
};

export function InvoiceItemRow({
  item,
  editing,
  editState,
  onStartEdit,
  onChangeDesc,
  onChangeQty,
  onChangePrice,
  onSave,
  onCancel,
  onRemove,
}: Props) {
  if (editing) {
    return (
      <div className="grid grid-cols-[1fr_80px_100px_100px_64px] gap-2 py-1.5 border-b border-border last:border-0 items-center">
        <Input
          aria-label="Description"
          value={editState.desc}
          onChange={(e) => onChangeDesc(e.target.value)}
          className="h-7 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Escape") onCancel();
          }}
        />
        <Input
          aria-label="Quantity"
          type="number"
          value={editState.qty}
          onChange={(e) => onChangeQty(e.target.value)}
          className="h-7 text-sm text-right"
          min="0"
          step="0.01"
          onKeyDown={(e) => {
            if (e.key === "Escape") onCancel();
          }}
        />
        <Input
          aria-label="Unit price"
          type="number"
          value={editState.price}
          onChange={(e) => onChangePrice(e.target.value)}
          className="h-7 text-sm text-right"
          min="0"
          step="0.01"
          onKeyDown={(e) => {
            if (e.key === "Enter") onSave();
            if (e.key === "Escape") onCancel();
          }}
        />
        <span className="text-right font-mono text-sm text-muted-foreground">
          {(
            (parseFloat(editState.qty) || 0) *
            (parseFloat(editState.price) || 0)
          ).toFixed(2)}
        </span>
        <div className="flex gap-1">
          <Button size="sm" className="h-7 px-2 text-xs" onClick={onSave}>
            ✓
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={onCancel}
          >
            ✕
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[1fr_80px_100px_100px_64px] gap-2 text-sm py-1.5 border-b border-border last:border-0 group">
      <span
        className="cursor-pointer hover:text-primary"
        onClick={onStartEdit}
        title="Click to edit"
      >
        {item.description}
      </span>
      <span
        className="text-right font-mono cursor-pointer hover:text-primary"
        onClick={onStartEdit}
      >
        {item.quantity.toFixed(2)}
      </span>
      <span
        className="text-right font-mono cursor-pointer hover:text-primary"
        onClick={onStartEdit}
      >
        {item.unitPrice.toFixed(2)}
      </span>
      <span className="text-right font-mono">{item.total.toFixed(2)}</span>
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-0 text-muted-foreground hover:text-destructive text-xs"
        onClick={onRemove}
        aria-label="Remove item"
      >
        ✕
      </Button>
    </div>
  );
}
