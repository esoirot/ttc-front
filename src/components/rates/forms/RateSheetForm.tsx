import { ClientPicker } from "@/components/clients/pickers/ClientPicker";
import { useState } from "react";
import { useIntl, FormattedMessage } from "react-intl";
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
import { useMyActivities } from "@/hooks/activities/useActivities";
import { CURRENCIES } from "@/constants/rates";
import { LANGUAGES } from "@/constants/languages";
import {
  MATCH_RATE_ITEMS,
  defaultMatchRates,
  type MatchRates,
} from "@/constants/matchRateItems";
import type { RateSheetFormProps } from "@/types/rate-sheets.types";
import { currencySymbol } from "@/lib/currency";

export function RateSheetForm({
  initial,
  onSave,
  onCancel,
  saving,
}: RateSheetFormProps) {
  const intl = useIntl();
  const { user } = useCurrentUser();
  const userCurrency = user?.defaultCurrency ?? "EUR";

  const noClient = intl.formatMessage({
    id: "rates.form.noClient",
    defaultMessage: "No client",
  });
  const { activities: allActivities } = useMyActivities();
  const activities = allActivities.filter(
    (a) => a.activityType === "TRANSLATOR",
  );

  const [name, setName] = useState(initial?.name ?? "");
  const [activityId, setActivityId] = useState<string>(
    initial?.activityId != null ? String(initial.activityId) : "__none__",
  );
  const [clientId, setClientId] = useState<string>(
    initial?.clientId != null ? String(initial.clientId) : "__none__",
  );
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false);
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
  const showLanguageFields = activityId !== "__none__";

  function setMatchRate(key: string, value: number) {
    setMatchRates((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) {
      setError(
        intl.formatMessage({
          id: "rates.form.nameRequired",
          defaultMessage: "Name is required.",
        }),
      );
      return;
    }
    if (showLanguageFields && !sourceLanguage) {
      setError(
        intl.formatMessage({
          id: "rates.form.sourceLanguageRequired",
          defaultMessage: "Source language is required.",
        }),
      );
      return;
    }
    if (showLanguageFields && !targetLanguage) {
      setError(
        intl.formatMessage({
          id: "rates.form.targetLanguageRequired",
          defaultMessage: "Target language is required.",
        }),
      );
      return;
    }
    const parsedPrice = parseFloat(pricePerWordStr.replace(",", "."));
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError(
        intl.formatMessage({
          id: "rates.sheetForm.priceInvalid",
          defaultMessage: "Price per word must be a valid number ≥ 0.",
        }),
      );
      return;
    }
    setError(null);
    onSave({
      activityId: activityId === "__none__" ? null : Number(activityId),
      clientId: clientId === "__none__" ? null : Number(clientId),
      name: name.trim(),
      description: description.trim() || null,
      sourceLanguage,
      targetLanguage,
      currency: activeCurrency,
      pricePerWord: parsedPrice,
      matchRates,
      isDefault: clientId === "__none__" ? false : isDefault,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Section 1: Basic info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="rs-name">
            <FormattedMessage id="rates.form.name" defaultMessage="Name" />
          </Label>
          <Input
            id="rs-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={intl.formatMessage({
              id: "rates.sheetForm.namePlaceholder",
              defaultMessage: "e.g. EN→FR Standard",
            })}
            required
          />
        </div>

        <div className="col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="rs-activity">
            <FormattedMessage
              id="rates.form.activityOptional"
              defaultMessage="Activity (optional)"
            />
          </Label>
          <Select value={activityId} onValueChange={setActivityId}>
            <SelectTrigger id="rs-activity">
              <SelectValue
                placeholder={intl.formatMessage({
                  id: "rates.form.noActivity",
                  defaultMessage: "No activity",
                })}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">
                <FormattedMessage
                  id="rates.form.noActivity"
                  defaultMessage="No activity"
                />
              </SelectItem>
              {activities.map((a) => (
                <SelectItem key={a.id} value={String(a.id)}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="rs-client">
            <FormattedMessage
              id="rates.form.clientOptional"
              defaultMessage="Client (optional)"
            />
          </Label>
          <ClientPicker
            id="rs-client"
            value={clientId === "__none__" ? "" : clientId}
            onChange={(v) => setClientId(v || "__none__")}
            placeholder={noClient}
            noneLabel={noClient}
          />
        </div>

        {clientId !== "__none__" && (
          <div className="col-span-2 flex items-center gap-2">
            <Checkbox
              id="rs-is-default"
              checked={isDefault}
              onCheckedChange={(v) => setIsDefault(Boolean(v))}
            />
            <Label htmlFor="rs-is-default">
              <FormattedMessage
                id="rates.sheetForm.defaultForClient"
                defaultMessage="Default rate sheet for this client"
              />
            </Label>
          </div>
        )}

        <div className="col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="rs-description">
            <FormattedMessage
              id="rates.form.description"
              defaultMessage="Description"
            />
          </Label>
          <Textarea
            id="rs-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={intl.formatMessage({
              id: "rates.form.descriptionPlaceholder",
              defaultMessage: "Optional description",
            })}
            rows={2}
          />
        </div>

        {showLanguageFields && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rs-source-lang">
              <FormattedMessage
                id="rates.form.sourceLanguage"
                defaultMessage="Source language"
              />
            </Label>
            <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
              <SelectTrigger id="rs-source-lang">
                <SelectValue
                  placeholder={intl.formatMessage({
                    id: "rates.form.selectEllipsis",
                    defaultMessage: "Select…",
                  })}
                />
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
        )}

        {showLanguageFields && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rs-target-lang">
              <FormattedMessage
                id="rates.form.targetLanguage"
                defaultMessage="Target language"
              />
            </Label>
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger id="rs-target-lang">
                <SelectValue
                  placeholder={intl.formatMessage({
                    id: "rates.form.selectEllipsis",
                    defaultMessage: "Select…",
                  })}
                />
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
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rs-price">
            <FormattedMessage
              id="rates.sheetForm.pricePerWord"
              defaultMessage="Price per word"
            />
          </Label>
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
          <Label className="invisible">
            <FormattedMessage
              id="rates.form.currency"
              defaultMessage="Currency"
            />
          </Label>
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
              <FormattedMessage
                id="rates.form.otherCurrency"
                defaultMessage="Other currency"
              />
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
        <p className="text-sm font-medium">
          <FormattedMessage
            id="rates.sheetForm.matchRates"
            defaultMessage="Match rates"
          />
        </p>
        <div className="rounded-md border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted text-muted-foreground">
                <th className="text-left px-3 py-2 font-medium">
                  <FormattedMessage
                    id="rates.sheetForm.category"
                    defaultMessage="Category"
                  />
                </th>
                <th className="text-center px-3 py-2 font-medium w-24">%</th>
                <th className="text-right px-3 py-2 font-medium w-32">
                  <FormattedMessage
                    id="rates.sheetForm.pricePerWordColumn"
                    defaultMessage="Price / word"
                  />
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
          {saving ? (
            <FormattedMessage id="rates.form.saving" defaultMessage="Saving…" />
          ) : (
            <FormattedMessage id="common.actions.save" defaultMessage="Save" />
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          <FormattedMessage
            id="common.actions.cancel"
            defaultMessage="Cancel"
          />
        </Button>
      </div>
    </form>
  );
}
