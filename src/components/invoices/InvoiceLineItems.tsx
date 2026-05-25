import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { InvoiceItemRow } from "./InvoiceItemRow";
import { AddItemForm } from "./AddItemForm";
import type { InvoiceItem } from "../../hooks/invoices/useInvoices";

type AddItemInput = {
  invoiceId: number;
  description: string;
  quantity: number;
  unitPrice: number;
  timeEntryId?: number;
};
type UpdateItemInput = {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
};

type Props = {
  invoiceId: number;
  items: InvoiceItem[];
  onAddItem: (input: AddItemInput) => Promise<unknown>;
  onUpdateItem: (input: UpdateItemInput) => Promise<unknown>;
  onRemoveItem: (id: number) => void;
  adding: boolean;
};

export function InvoiceLineItems({
  invoiceId,
  items,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  adding,
}: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editQty, setEditQty] = useState("");
  const [editPrice, setEditPrice] = useState("");

  function startEdit(item: InvoiceItem) {
    setEditingId(item.id);
    setEditDesc(item.description);
    setEditQty(String(item.quantity));
    setEditPrice(String(item.unitPrice));
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleSave(itemId: number) {
    const qty = parseFloat(editQty);
    const price = parseFloat(editPrice);
    if (isNaN(qty) || isNaN(price)) return;
    await onUpdateItem({
      id: itemId,
      description: editDesc,
      quantity: qty,
      unitPrice: price,
    });
    setEditingId(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Line items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[1fr_80px_100px_100px_64px] gap-2 text-xs font-semibold text-muted-foreground mb-2">
          <span>Description</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Unit price</span>
          <span className="text-right">Total</span>
          <span />
        </div>
        <Separator className="mb-2" />
        {items.length === 0 && (
          <p className="text-muted-foreground text-sm py-2">No items yet.</p>
        )}
        {items.map((item) => (
          <InvoiceItemRow
            key={item.id}
            item={item}
            editing={editingId === item.id}
            editState={{ desc: editDesc, qty: editQty, price: editPrice }}
            onStartEdit={() => startEdit(item)}
            onChangeDesc={setEditDesc}
            onChangeQty={setEditQty}
            onChangePrice={setEditPrice}
            onSave={() => void handleSave(item.id)}
            onCancel={cancelEdit}
            onRemove={() => onRemoveItem(item.id)}
          />
        ))}

        {showAddForm ? (
          <AddItemForm
            invoiceId={invoiceId}
            onAdd={onAddItem}
            loading={adding}
            onClose={() => setShowAddForm(false)}
          />
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => setShowAddForm(true)}
          >
            + Add item
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
