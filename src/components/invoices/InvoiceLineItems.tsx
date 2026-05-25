import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { InvoiceItemRow } from "./InvoiceItemRow";
import { AddItemDialog } from "./AddItemDialog";
import { useItemEdit } from "../../hooks/invoices/useItemEdit";
import type { InvoiceLineItemsProps as Props } from "@/types/invoices.types";

export function InvoiceLineItems({
  invoiceId,
  items,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  adding,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const {
    editingId,
    editState,
    startEdit,
    cancelEdit,
    setEditDesc,
    setEditQty,
    setEditPrice,
  } = useItemEdit();

  const alreadyAddedEntryIds = new Set(
    items.flatMap((item) =>
      item.timeEntryId != null ? [item.timeEntryId] : [],
    ),
  );

  async function handleSave(itemId: number) {
    const qty = parseFloat(editState.qty);
    const price = parseFloat(editState.price);
    if (isNaN(qty) || isNaN(price)) return;
    await onUpdateItem({
      id: itemId,
      description: editState.desc,
      quantity: qty,
      unitPrice: price,
    });
    cancelEdit();
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
            editState={editState}
            onStartEdit={() => startEdit(item)}
            onChangeDesc={setEditDesc}
            onChangeQty={setEditQty}
            onChangePrice={setEditPrice}
            onSave={() => void handleSave(item.id)}
            onCancel={cancelEdit}
            onRemove={() => onRemoveItem(item.id)}
          />
        ))}

        <Button
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={() => setDialogOpen(true)}
        >
          + Add item
        </Button>
        <AddItemDialog
          invoiceId={invoiceId}
          alreadyAddedEntryIds={alreadyAddedEntryIds}
          onAdd={onAddItem}
          adding={adding}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </CardContent>
    </Card>
  );
}
