import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRateCrud } from "../../hooks/rates/useRateCrud";
import type { OverviewSectionProps } from "@/types/rates.types";
import { TYPE_LABELS, TYPE_UNIT } from "@/constants/rates";
import { RateForm } from "./RateForm";

export function OverviewSection({
  type,
  rates,
  loading,
}: OverviewSectionProps) {
  const label = TYPE_LABELS[type];
  const unit = TYPE_UNIT[type];
  const {
    creating,
    updating,
    showForm,
    setShowForm,
    editingId,
    setEditingId,
    handleCreate,
    handleUpdate,
  } = useRateCrud(type);

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-sm font-semibold">{label}</h3>
        <Badge variant="secondary" className="text-xs">
          {rates.length}
        </Badge>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto h-6 px-2 text-xs"
          onClick={() => {
            setEditingId(null);
            setShowForm((v) => !v);
          }}
        >
          {showForm ? "Cancel" : "+ Add"}
        </Button>
      </div>
      {loading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
        </div>
      ) : rates.length === 0 ? (
        <p className="text-xs text-muted-foreground">No rates defined.</p>
      ) : (
        <div className="flex flex-col gap-1">
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
              <div
                key={rate.id}
                className="flex items-center justify-between text-sm px-3 py-1.5 rounded bg-muted/40"
              >
                <span className="truncate">
                  {rate.name}
                  {rate.description && (
                    <span className="text-muted-foreground ml-1">
                      — {rate.description}
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <span className="font-mono font-semibold">
                    {rate.amount.toFixed(type === "PER_WORD" ? 4 : 2)}{" "}
                    <span className="font-normal text-muted-foreground text-xs">
                      {rate.currency} {unit}
                    </span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(rate.id);
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ),
          )}
        </div>
      )}

      {showForm && (
        <RateForm
          type={type}
          onSave={(data) => void handleCreate(data)}
          onCancel={() => setShowForm(false)}
          saving={creating}
        />
      )}
    </div>
  );
}
