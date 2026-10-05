import { useState } from "react";
import { FormattedMessage } from "react-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import type { InvoiceLineItemsProps as Props } from "@/types/invoices.types";
import { useItemEdit } from "@/hooks/invoices/useItemEdit";
import { InvoiceItemRow } from "../itemRows/InvoiceItemRow";
import { AddItemDialog } from "../dialogs/AddItemDialog";

// Strict decimal parse that also accepts a comma ("1,5"); parseFloat would
// silently truncate "1,5" to 1 and "3abc" to 3.
function parseDecimal(value: string): number {
  const v = value.trim().replace(",", ".");
  return v === "" ? NaN : Number(v);
}

export function InvoiceLineItems({
  invoiceId,
  items,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  adding,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [invalidNumber, setInvalidNumber] = useState(false);
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
    const qty = parseDecimal(editState.qty);
    const price = parseDecimal(editState.price);
    if (isNaN(qty) || isNaN(price)) {
      setInvalidNumber(true);
      return;
    }
    setInvalidNumber(false);
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
        <CardTitle className="text-sm">
          <FormattedMessage
            id="invoices.lineItems.title"
            defaultMessage="Line items"
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[1fr_80px_100px_100px_64px] gap-2 text-xs font-semibold text-muted-foreground mb-2">
          <span>
            <FormattedMessage
              id="invoices.itemRow.description"
              defaultMessage="Description"
            />
          </span>
          <span className="text-right">
            <FormattedMessage
              id="invoices.lineItems.qty"
              defaultMessage="Qty"
            />
          </span>
          <span className="text-right">
            <FormattedMessage
              id="invoices.timeEntriesTab.unitPrice"
              defaultMessage="Unit price"
            />
          </span>
          <span className="text-right">
            <FormattedMessage
              id="invoices.lineItems.total"
              defaultMessage="Total"
            />
          </span>
          <span />
        </div>
        <Separator className="mb-2" />
        {items.length === 0 && (
          <p className="text-muted-foreground text-sm py-2">
            <FormattedMessage
              id="invoices.lineItems.empty"
              defaultMessage="No items yet."
            />
          </p>
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
            onCancel={() => {
              setInvalidNumber(false);
              cancelEdit();
            }}
            onRemove={() => onRemoveItem(item.id)}
          />
        ))}

        {invalidNumber && editingId != null && (
          <p className="text-sm text-destructive mt-2">
            <FormattedMessage
              id="invoices.lineItems.invalidNumber"
              defaultMessage="Quantity and unit price must be valid numbers."
            />
          </p>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={() => setDialogOpen(true)}
        >
          <FormattedMessage
            id="invoices.lineItems.addItem"
            defaultMessage="+ Add item"
          />
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
