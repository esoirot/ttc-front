import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrentUser } from "@/hooks/auth/useAuth";
import { useClients } from "@/hooks/clients/useClients";
import { CURRENCIES } from "@/constants/rates";
import { LANGUAGES } from "@/constants/languages";
import {
  MATCH_RATE_ITEMS,
  defaultMatchRates,
  type MatchRates,
} from "@/constants/matchRateItems";
import type {
  RateSheet,
  CreateRateSheetInput,
} from "@/types/rate-sheets.types";

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  CHF: "Fr",
  CAD: "CA$",
  AUD: "A$",
  JPY: "¥",
};

function currencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code] ?? code;
}

interface RateSheetFormProps {
  initial?: RateSheet;
  onSave: (data: CreateRateSheetInput) => void;
  onCancel: () => void;
  saving: boolean;
}

export function RateSheetForm({
  initial,
  onSave,
  onCancel,
  saving,
}: RateSheetFormProps) {
  const { user } = useCurrentUser();
  const userCurrency = user?.defaultCurrency ?? "EUR";

  const { clients } = useClients();

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
  const [pricePerWordStr, setPricePerWordStr] = useState(
    initial ? initial.pricePerWord.toFixed(4) : "0.0000",
  );
  const [useOtherCurrency, setUseOtherCurrency] = useState(
    initial ? initial.currency !== userCurrency : false,
  );
  const [currency, setCurrency] = useState(initial?.currency ?? userCurrency);
  const [matchRates, setMatchRates] = useState<MatchRates>(() => {
    if (!initial) return defaultMatchRates();
    return Object.fromEntries(
      Object.entries(initial.matchRates).filter(([k]) => k !== "__typename"),
    ) as MatchRates;
  });
  const [error, setError] = useState<string | null>(null);

  const activeCurrency = useOtherCurrency ? currency : userCurrency;
  const pricePerWord = parseFloat(pricePerWordStr.replace(",", ".")) || 0;

  function setMatchRate(key: string, value: number) {
    setMatchRates((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!sourceLanguage) {
      setError("Source language is required.");
      return;
    }
    if (!targetLanguage) {
      setError("Target language is required.");
      return;
    }
    const parsedPrice = parseFloat(pricePerWordStr.replace(",", "."));
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError("Price per word must be a valid number ≥ 0.");
      return;
    }
    setError(null);
    onSave({
      clientId: clientId === "__none__" ? null : Number(clientId),
      name: name.trim(),
      description: description.trim() || undefined,
      sourceLanguage,
      targetLanguage,
      currency: activeCurrency,
      pricePerWord: parsedPrice,
      matchRates,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Section 1: Basic info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="rs-name">Name</Label>
          <Input
            id="rs-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. EN→FR Standard"
            required
          />
        </div>

        <div className="col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="rs-client">Client (optional)</Label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger id="rs-client">
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
          <Label htmlFor="rs-description">Description</Label>
          <Textarea
            id="rs-description"
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
          <Label htmlFor="rs-price">Price per word</Label>
          <div className="relative">
            <Input
              id="rs-price"
              inputMode="decimal"
              value={pricePerWordStr}
              onChange={(e) => {
                const v = e.target.value;
                const sep = v.includes(",") ? "," : ".";
                const parts = v.split(sep);
                if (parts.length > 1 && parts[1].length > 4) return;
                setPricePerWordStr(v);
              }}
              className="pr-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
              {currencySymbol(activeCurrency)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="invisible">Currency</Label>
          <div className="flex items-center gap-2 h-9">
            <Checkbox
              id="rs-other-currency"
              checked={useOtherCurrency}
              onCheckedChange={(v) => setUseOtherCurrency(Boolean(v))}
            />
            <Label
              htmlFor="rs-other-currency"
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

      {/* Section 2: Match rates grid */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Match rates</p>
        <div className="rounded-md border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted text-muted-foreground">
                <th className="text-left px-3 py-2 font-medium">Category</th>
                <th className="text-center px-3 py-2 font-medium w-24">%</th>
                <th className="text-right px-3 py-2 font-medium w-32">
                  Price / word
                </th>
              </tr>
            </thead>
            <tbody>
              {MATCH_RATE_ITEMS.map(({ key, label }, i) => {
                const pct = matchRates[key];
                const price = pricePerWord * (pct / 100);
                return (
                  <tr
                    key={key}
                    className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}
                  >
                    <td className="px-3 py-1.5 text-foreground">{label}</td>
                    <td className="px-3 py-1.5 text-center">
                      <div className="relative inline-flex items-center mx-auto">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={pct}
                          onChange={(e) =>
                            setMatchRate(
                              key,
                              Math.max(
                                0,
                                Math.min(100, Number(e.target.value)),
                              ),
                            )
                          }
                          className="h-7 w-20 text-center font-mono pr-6"
                        />
                        <span className="absolute right-2 text-xs text-muted-foreground pointer-events-none">
                          %
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono text-muted-foreground">
                      {price.toFixed(4)}
                      {currencySymbol(activeCurrency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
