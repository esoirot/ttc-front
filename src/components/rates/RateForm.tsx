import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RateFormProps } from "@/types/rates.types";
import { CURRENCIES, TYPE_UNIT } from "@/constants/rates";

export function RateForm({
  type,
  initial,
  onSave,
  onCancel,
  saving,
}: RateFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [amount, setAmount] = useState(String(initial?.amount ?? ""));
  const [currency, setCurrency] = useState(initial?.currency ?? "EUR");
  const [description, setDescription] = useState(initial?.description ?? "");

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!name.trim() || isNaN(parsed) || parsed <= 0) return;
    onSave({
      name: name.trim(),
      amount: parsed,
      currency,
      description: description.trim() || undefined,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 mt-4 p-4 border border-border rounded-lg bg-muted/30"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="rate-name" className="text-xs">
            Name
          </Label>
          <Input
            id="rate-name"
            placeholder={
              type === "HOURLY"
                ? "e.g. Standard, Technical"
                : type === "PER_WORD"
                  ? "e.g. General, Specialised"
                  : "e.g. Document review, Proofreading"
            }
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 text-sm"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="rate-amount" className="text-xs">
            Amount ({TYPE_UNIT[type]})
          </Label>
          <Input
            id="rate-amount"
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
          <Label htmlFor="rate-currency" className="text-xs">
            Currency
          </Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger id="rate-currency" className="h-8 text-sm">
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
        <div className="flex flex-col gap-1">
          <Label htmlFor="rate-desc" className="text-xs">
            Description (optional)
          </Label>
          <Input
            id="rate-desc"
            placeholder="e.g. EN→FR, legal documents"
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
