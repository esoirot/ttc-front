import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { TranslationRateFormProps } from "@/types/rates.types";
import { CURRENCIES, CURRENCY_SYMBOLS, TYPE_UNIT } from "@/constants/rates";
import { LANGUAGES } from "@/constants/languages";
import { useClients } from "@/hooks/clients/useClients";
import { useCurrentUser } from "@/hooks/auth/useAuth";

export function RateForm({
  type,
  initial,
  onSave,
  onCancel,
  saving,
}: TranslationRateFormProps) {
  const { clients } = useClients();
  const { user } = useCurrentUser();
  const userCurrency = user?.defaultCurrency ?? "EUR";

  const [name, setName] = useState(initial?.name ?? "");
  const [clientId, setClientId] = useState<string>(
    initial?.clientId != null ? String(initial.clientId) : "__none__",
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [sourceLanguage, setSourceLanguage] = useState(
    initial?.sourceLanguage ?? "",
  );
  const [targetLanguage, setTargetLanguage] = useState(
    initial?.targetLanguage ?? "",
  );
  const [amountStr, setAmountStr] = useState(
    initial ? initial.amount.toFixed(type === "PER_WORD" ? 4 : 2) : "",
  );
  const [useOtherCurrency, setUseOtherCurrency] = useState(
    initial ? initial.currency !== userCurrency : false,
  );
  const [currency, setCurrency] = useState(initial?.currency ?? userCurrency);
  const [error, setError] = useState<string | null>(null);

  const activeCurrency = useOtherCurrency ? currency : userCurrency;
  const sym = CURRENCY_SYMBOLS[activeCurrency] ?? activeCurrency;
  const maxDp = type === "PER_WORD" ? 4 : 2;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (type === "PER_WORD" && !sourceLanguage) {
      setError("Source language is required.");
      return;
    }
    if (type === "PER_WORD" && !targetLanguage) {
      setError("Target language is required.");
      return;
    }
    const parsed = parseFloat(amountStr.replace(",", "."));
    if (isNaN(parsed) || parsed < 0) {
      setError("Amount must be a valid number ≥ 0.");
      return;
    }
    setError(null);
    onSave({
      name: name.trim(),
      amount: parsed,
      currency: activeCurrency,
      description: description.trim() || undefined,
      clientId: clientId === "__none__" ? null : Number(clientId),
      sourceLanguage: sourceLanguage || undefined,
      targetLanguage: targetLanguage || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="rate-name">Name</Label>
          <Input
            id="rate-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={
              type === "HOURLY" || type === "DAY"
                ? "e.g. Standard, Technical"
                : type === "FIXED"
                  ? "e.g. Document review, Proofreading"
                  : "e.g. General, Specialised"
            }
            required
          />
        </div>

        <div className="col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="rate-client">Client (optional)</Label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger id="rate-client">
              <SelectValue placeholder="No client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">No client</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="rate-desc">Description</Label>
          <Textarea
            id="rate-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            rows={2}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Source language</Label>
          <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l.code} value={l.code}>
                  {l.code} — {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Target language</Label>
          <Select value={targetLanguage} onValueChange={setTargetLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l.code} value={l.code}>
                  {l.code} — {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rate-amount">Amount ({TYPE_UNIT[type]})</Label>
          <div className="relative">
            <Input
              id="rate-amount"
              inputMode="decimal"
              value={amountStr}
              onChange={(e) => {
                const v = e.target.value;
                const sep = v.includes(",") ? "," : ".";
                const parts = v.split(sep);
                if (parts.length > 1 && parts[1].length > maxDp) return;
                setAmountStr(v);
              }}
              className="pr-10"
              placeholder={type === "PER_WORD" ? "0.0000" : "0.00"}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
              {sym}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="invisible">Currency</Label>
          <div className="flex items-center gap-2 h-9">
            <Checkbox
              id="rate-other-currency"
              checked={useOtherCurrency}
              onCheckedChange={(v) => setUseOtherCurrency(Boolean(v))}
            />
            <Label
              htmlFor="rate-other-currency"
              className="cursor-pointer whitespace-nowrap"
            >
              Other currency
            </Label>
            {useOtherCurrency && (
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-28">
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
            )}
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : initial ? "Save" : "Add Rate"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
