import { useState } from "react";
import type { FormState, InvoiceMetaUpdateInput } from "@/types/invoices.types";

export function useInvoiceMetaEdit({
  clientId,
  currency,
  dueDate,
  notes,
  onUpdate,
}: {
  clientId: number | null;
  currency: string;
  dueDate: string | null;
  notes: string | null;
  onUpdate: (input: InvoiceMetaUpdateInput) => Promise<unknown>;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({
    clientId: clientId != null ? String(clientId) : "none",
    currency,
    dueDate: dueDate?.slice(0, 10) ?? "",
    notes: notes ?? "",
  });

  function openEdit() {
    setForm({
      clientId: clientId != null ? String(clientId) : "none",
      currency,
      dueDate: dueDate?.slice(0, 10) ?? "",
      notes: notes ?? "",
    });
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onUpdate({
        clientId: form.clientId !== "none" ? Number(form.clientId) : null,
        currency: form.currency,
        dueDate: form.dueDate || null,
        notes: form.notes.trim() || null,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return { editing, saving, form, setForm, openEdit, cancelEdit, handleSave };
}
