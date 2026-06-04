import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  CURRENCIES,
  TRANSLATION_RATE_TYPES as RATE_TYPES,
  TYPE_LABELS,
  TYPE_UNIT,
} from "@/constants/rates";
import type { TranslationRateType } from "@/types/rates.types";
import type { ClientRate } from "@/types/client-rates.types";
import {
  useClientRates,
  useCreateClientRate,
  useDeleteClientRate,
  useUpdateClientRate,
} from "@/hooks/clients/useClientRates";

interface FormData {
  type: TranslationRateType;
  name: string;
  amount: string;
  currency: string;
  description: string;
}

function ClientRateForm({
  clientId,
  initial,
  onSave,
  onCancel,
  saving,
}: {
  clientId: number;
  initial?: ClientRate;
  onSave: (data: FormData) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [type, setType] = useState<TranslationRateType>(
    initial?.type ?? "HOURLY",
  );
  const [name, setName] = useState(initial?.name ?? "");
  const [amount, setAmount] = useState(String(initial?.amount ?? ""));
  const [currency, setCurrency] = useState(initial?.currency ?? "EUR");
  const [description, setDescription] = useState(initial?.description ?? "");

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!name.trim() || isNaN(parsed) || parsed <= 0) return;
    onSave({
      type,
      name: name.trim(),
      amount,
      currency,
      description: description.trim(),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 mt-4 p-4 border border-border rounded-lg bg-muted/30"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor={`cr-type-${clientId}`} className="text-xs">
            Type
          </Label>
          <Select
            value={type}
            onValueChange={(v) => setType(v as TranslationRateType)}
          >
            <SelectTrigger id={`cr-type-${clientId}`} className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RATE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor={`cr-name-${clientId}`} className="text-xs">
            Name
          </Label>
          <Input
            id={`cr-name-${clientId}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Standard"
            className="h-8 text-sm"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor={`cr-amount-${clientId}`} className="text-xs">
            Amount ({TYPE_UNIT[type]})
          </Label>
          <Input
            id={`cr-amount-${clientId}`}
            type="number"
            min="0"
            step="0.0001"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-8 text-sm"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor={`cr-currency-${clientId}`} className="text-xs">
            Currency
          </Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger
              id={`cr-currency-${clientId}`}
              className="h-8 text-sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 flex flex-col gap-1">
          <Label htmlFor={`cr-desc-${clientId}`} className="text-xs">
            Description (optional)
          </Label>
          <Input
            id={`cr-desc-${clientId}`}
            placeholder="e.g. Legal translation, EN→FR"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? "Saving…" : initial ? "Save" : "Add Rate"}
        </Button>
      </div>
    </form>
  );
}

export function ClientRatesTab({ clientId }: { clientId: number }) {
  const { clientRates, loading } = useClientRates(clientId);
  const { createClientRate, loading: creating } = useCreateClientRate(clientId);
  const { updateClientRate, loading: updating } = useUpdateClientRate(clientId);
  const { deleteClientRate } = useDeleteClientRate(clientId);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  async function handleCreate(data: FormData) {
    await createClientRate({
      type: data.type,
      name: data.name,
      amount: parseFloat(data.amount),
      currency: data.currency,
      description: data.description || null,
    });
    setShowForm(false);
  }

  async function handleUpdate(id: number, data: FormData) {
    await updateClientRate({
      id,
      type: data.type,
      name: data.name,
      amount: parseFloat(data.amount),
      currency: data.currency,
      description: data.description || null,
    });
    setEditingId(null);
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-2 mt-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {clientRates.length === 0 && !showForm ? (
        <p className="text-sm text-muted-foreground mt-4">
          No rates defined for this client yet.
        </p>
      ) : (
        <div className="mt-0">
          {clientRates.map((rate) =>
            editingId === rate.id ? (
              <ClientRateForm
                key={rate.id}
                clientId={clientId}
                initial={rate}
                onSave={(data) => void handleUpdate(rate.id, data)}
                onCancel={() => setEditingId(null)}
                saving={updating}
              />
            ) : (
              <div
                key={rate.id}
                className="flex items-center justify-between py-3 border-b border-border last:border-0 gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs shrink-0">
                      {TYPE_LABELS[rate.type]}
                    </Badge>
                    <span className="font-medium text-sm truncate">
                      {rate.name}
                    </span>
                    {rate.description && (
                      <span className="text-xs text-muted-foreground truncate">
                        — {rate.description}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-sm font-semibold tabular-nums">
                    {rate.amount.toFixed(rate.type === "PER_WORD" ? 4 : 2)}
                  </span>
                  <Badge variant="secondary" className="text-xs font-mono">
                    {rate.currency}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(rate.id);
                    }}
                  >
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                        onClick={(e) => e.stopPropagation()}
                      >
                        ✕
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete &ldquo;{rate.name}&rdquo;?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This client rate will be permanently deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => void deleteClientRate(rate.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ),
          )}
        </div>
      )}

      {showForm ? (
        <ClientRateForm
          clientId={clientId}
          onSave={(data) => void handleCreate(data)}
          onCancel={() => setShowForm(false)}
          saving={creating}
        />
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => {
            setEditingId(null);
            setShowForm(true);
          }}
        >
          + Add Rate
        </Button>
      )}
    </div>
  );
}
