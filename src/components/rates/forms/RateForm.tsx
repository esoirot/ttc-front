import { useState } from "react";
import { useIntl, FormattedMessage } from "react-intl";
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
import {
  CURRENCIES,
  CURRENCY_SYMBOLS,
  TYPE_UNIT_MESSAGES,
} from "@/constants/rates";
import { LANGUAGES } from "@/constants/languages";
import { useAllClients } from "@/hooks/clients/useClients";
import { useCurrentUser } from "@/hooks/auth/useAuth";
import { useMyActivities } from "@/hooks/activities/useActivities";

export function RateForm({
  type,
  initial,
  defaultActivityId,
  onSave,
  onCancel,
  saving,
}: TranslationRateFormProps) {
  const intl = useIntl();
  const { clients } = useAllClients();
  const { activities } = useMyActivities();
  const { user } = useCurrentUser();
  const userCurrency = user?.defaultCurrency ?? "EUR";

  const [name, setName] = useState(initial?.name ?? "");
  const [activityId, setActivityId] = useState<string>(
    initial?.activityId != null
      ? String(initial.activityId)
      : defaultActivityId != null
        ? String(defaultActivityId)
        : "__none__",
  );
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
  const selectedActivity =
    activityId !== "__none__"
      ? activities.find((a) => String(a.id) === activityId)
      : undefined;
  const showLanguageFields = selectedActivity?.activityType === "TRANSLATOR";

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
    const parsed = parseFloat(amountStr.replace(",", "."));
    if (isNaN(parsed) || parsed < 0) {
      setError(
        intl.formatMessage({
          id: "rates.form.amountInvalid",
          defaultMessage: "Amount must be a valid number ≥ 0.",
        }),
      );
      return;
    }
    setError(null);
    onSave({
      name: name.trim(),
      amount: parsed,
      currency: activeCurrency,
      description: description.trim() || null,
      activityId: activityId === "__none__" ? null : Number(activityId),
      clientId: clientId === "__none__" ? null : Number(clientId),
      sourceLanguage: sourceLanguage || null,
      targetLanguage: targetLanguage || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="rate-name">
            <FormattedMessage id="rates.form.name" defaultMessage="Name" />
          </Label>
          <Input
            id="rate-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={intl.formatMessage(
              type === "HOURLY" || type === "DAY"
                ? {
                    id: "rates.form.namePlaceholderHourly",
                    defaultMessage: "e.g. Standard, Technical",
                  }
                : type === "FIXED"
                  ? {
                      id: "rates.form.namePlaceholderFixed",
                      defaultMessage: "e.g. Document review, Proofreading",
                    }
                  : {
                      id: "rates.form.namePlaceholderPerWord",
                      defaultMessage: "e.g. General, Specialised",
                    },
            )}
            required
          />
        </div>

        <div className="col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="rate-activity">
            <FormattedMessage
              id="rates.form.activityOptional"
              defaultMessage="Activity (optional)"
            />
          </Label>
          <Select value={activityId} onValueChange={setActivityId}>
            <SelectTrigger id="rate-activity">
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
          <Label htmlFor="rate-client">
            <FormattedMessage
              id="rates.form.clientOptional"
              defaultMessage="Client (optional)"
            />
          </Label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger id="rate-client">
              <SelectValue
                placeholder={intl.formatMessage({
                  id: "rates.form.noClient",
                  defaultMessage: "No client",
                })}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">
                <FormattedMessage
                  id="rates.form.noClient"
                  defaultMessage="No client"
                />
              </SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="rate-desc">
            <FormattedMessage
              id="rates.form.description"
              defaultMessage="Description"
            />
          </Label>
          <Textarea
            id="rate-desc"
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
            <Label htmlFor="rate-source-lang">
              <FormattedMessage
                id="rates.form.sourceLanguage"
                defaultMessage="Source language"
              />
            </Label>
            <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
              <SelectTrigger id="rate-source-lang">
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
            <Label htmlFor="rate-target-lang">
              <FormattedMessage
                id="rates.form.targetLanguage"
                defaultMessage="Target language"
              />
            </Label>
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger id="rate-target-lang">
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
          <Label htmlFor="rate-amount">
            Amount ({intl.formatMessage(TYPE_UNIT_MESSAGES[type])})
          </Label>
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
          <Label className="invisible">
            <FormattedMessage
              id="rates.form.currency"
              defaultMessage="Currency"
            />
          </Label>
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

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? (
            <FormattedMessage id="rates.form.saving" defaultMessage="Saving…" />
          ) : initial ? (
            <FormattedMessage id="common.actions.save" defaultMessage="Save" />
          ) : (
            <FormattedMessage
              id="rates.form.addRate"
              defaultMessage="Add Rate"
            />
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
