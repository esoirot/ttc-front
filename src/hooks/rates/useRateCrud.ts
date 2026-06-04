import { useState } from "react";
import { useCreateRate, useUpdateRate, useDeleteRate } from "./useRates";
import type {
  TranslationRateFormData,
  TranslationRateType,
} from "@/types/rates.types";

export type { TranslationRateFormData };

export function useRateCrud(type: TranslationRateType) {
  const { createRate, loading: creating } = useCreateRate(type);
  const { updateRate, loading: updating } = useUpdateRate(type);
  const { deleteRate } = useDeleteRate(type);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  async function handleCreate(data: TranslationRateFormData) {
    await createRate({ type, ...data });
    setShowForm(false);
  }

  async function handleUpdate(id: number, data: TranslationRateFormData) {
    await updateRate({ id, ...data });
    setEditingId(null);
  }

  return {
    creating,
    updating,
    deleteRate,
    showForm,
    setShowForm,
    editingId,
    setEditingId,
    handleCreate,
    handleUpdate,
  };
}
