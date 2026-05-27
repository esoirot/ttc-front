import type { InvoiceItem } from "@/types/invoices.types";
import { useState } from "react";

export function useItemEdit() {
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

  return {
    editingId,
    editState: { desc: editDesc, qty: editQty, price: editPrice },
    startEdit,
    cancelEdit,
    setEditDesc,
    setEditQty,
    setEditPrice,
  };
}
