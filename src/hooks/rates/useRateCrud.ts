import { useState } from "react";
import {
  useCreateRate,
  useUpdateRate,
  useDeleteRate,
  type RateType,
} from "./useRates";

export type RateFormData = {
  name: string;
  amount: number;
  currency: string;
  description?: string;
};

export function useRateCrud(type: RateType) {
  const { createRate, loading: creating } = useCreateRate(type);
  const { updateRate, loading: updating } = useUpdateRate(type);
  const { deleteRate } = useDeleteRate(type);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  async function handleCreate(data: RateFormData) {
    await createRate({ type, ...data });
    setShowForm(false);
  }

  async function handleUpdate(id: number, data: RateFormData) {
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
