import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { TYPE_LABELS } from "@/constants/rates";

import type { TranslationRateListProps } from "@/types/rates.types";
import { useRates } from "@/hooks/rates/useRates";
import { useRateCrud } from "@/hooks/rates/useRateCrud";
import { RateForm } from "../forms/RateForm";
import { RateRow } from "../rows/RateRow";

export function RateList({ type }: TranslationRateListProps) {
  const { rates, loading } = useRates(type);
  const {
    creating,
    updating,
    deleteRate,
    showForm,
    setShowForm,
    editingId,
    setEditingId,
    handleCreate,
    handleUpdate,
  } = useRateCrud(type);

  if (loading) {
    return (
      <div className="flex flex-col gap-2 mt-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {rates.length === 0 && !showForm ? (
        <p className="text-sm text-muted-foreground mt-4">
          No {TYPE_LABELS[type].toLowerCase()} rates yet.
        </p>
      ) : (
        <div className="mt-0">
          {rates.map((rate) =>
            editingId === rate.id ? (
              <RateForm
                key={rate.id}
                type={type}
                initial={rate}
                onSave={(data) => void handleUpdate(rate.id, data)}
                onCancel={() => setEditingId(null)}
                saving={updating}
              />
            ) : (
              <RateRow
                key={rate.id}
                rate={rate}
                onEdit={() => {
                  setShowForm(false);
                  setEditingId(rate.id);
                }}
                onDelete={() => void deleteRate(rate.id)}
              />
            ),
          )}
        </div>
      )}

      {showForm ? (
        <RateForm
          type={type}
          onSave={(data) => void handleCreate(data)}
          onCancel={() => setShowForm(false)}
          saving={creating}
        />
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="mt-0"
          onClick={() => {
            setEditingId(null);
            setShowForm(true);
          }}
        >
          + Add {TYPE_LABELS[type]} Rate
        </Button>
      )}
    </div>
  );
}
