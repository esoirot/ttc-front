import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProjectStatus, ProjectHeaderProps } from "@/types/projects.types";
import { STATUS_VARIANTS, STATUS_BADGE_CLASSES } from "@/constants/projects";
import type { TranslationRate } from "@/types/rates.types";
import type { ClientRate } from "@/types/client-rates.types";
import { useRates } from "@/hooks/rates/useRates";
import { useClientRates } from "@/hooks/clients/useClientRates";
import { useRateSheets } from "@/hooks/rate-sheets/useRateSheets";
import {
  defaultClientRateSheetId,
  resolveProjectRateSheet,
} from "@/lib/projectRate";
import { STATUSES } from "@/constants/projects";
import { LANGUAGES } from "@/constants/languages";
import { useMyActivities } from "@/hooks/activities/useActivities";
import { ActivityChips } from "@/components/activities/ActivityChips";

type RateOption = TranslationRate | ClientRate;

function RatePicker({
  allRates,
  onPick,
}: {
  allRates: RateOption[];
  onPick: (amount: number, currency: string) => void;
}) {
  if (allRates.length === 0) return null;
  return (
    <Select
      value=""
      onValueChange={(val) => {
        const rate = allRates.find((r) => String(r.id) === val);
        if (!rate) return;
        onPick(rate.amount, rate.currency);
      }}
    >
      <SelectTrigger className="h-6 text-xs w-auto border-0 shadow-none text-muted-foreground hover:text-foreground px-1 gap-1">
        <SelectValue placeholder="From rate…" />
      </SelectTrigger>
      <SelectContent>
        {allRates.map((r) => (
          <SelectItem key={r.id} value={String(r.id)}>
            {r.name} — {r.amount} {r.currency}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function buildFormState(project: ProjectHeaderProps["project"]) {
  return {
    title: project.title,
    description: project.description ?? "",
    status: project.status,
    clientId: project.clientId != null ? String(project.clientId) : "__none__",
    sourceLanguage: project.sourceLanguage ?? "",
    targetLanguage: project.targetLanguage ?? "",
    wordCount: project.wordCount != null ? String(project.wordCount) : "",
    currency: project.currency ?? "EUR",
    fixedFee: project.fixedFee != null ? String(project.fixedFee) : "",
    hourlyRate: project.hourlyRate != null ? String(project.hourlyRate) : "",
    perWordRate: project.perWordRate != null ? String(project.perWordRate) : "",
    useCustomRate: project.useCustomRate,
    // undefined = user hasn't explicitly picked one yet; the effective value
    // is then computed live each render from the current client's rate
    // sheets, so it can't go stale if that data loads after this form does.
    rateSheetId:
      project.rateSheetId != null ? String(project.rateSheetId) : undefined,
    deadline: project.deadline?.slice(0, 10) ?? "",
    startDate: project.startDate?.slice(0, 10) ?? "",
    activityIds: (project.activities ?? []).map((a) => a.id),
  };
}

export function ProjectHeader({
  project,
  clients,
  onUpdate,
  saving,
}: ProjectHeaderProps) {
  const { rates: userRates } = useRates();
  const { activities } = useMyActivities();
  const clientIdNum = project.clientId;
  const { clientRates } = useClientRates(clientIdNum);
  const { rateSheets } = useRateSheets();
  const resolvedRateSheet = resolveProjectRateSheet(rateSheets, project);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => buildFormState(project));

  function resetForm() {
    setForm(buildFormState(project));
  }

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function parseNonNegative(str: string): number | null {
    return str ? Number(str) : null;
  }

  function handleClientChange(val: string) {
    setForm((prev) => ({ ...prev, clientId: val, rateSheetId: undefined }));
  }

  const formClientId =
    form.clientId === "__none__" ? null : Number(form.clientId);
  const formClientRateSheets = rateSheets.filter(
    (s) => s.clientId === formClientId,
  );
  const formDefaultRateSheetId = defaultClientRateSheetId(formClientRateSheets);
  const effectiveRateSheetId =
    form.rateSheetId ??
    (formDefaultRateSheetId != null
      ? String(formDefaultRateSheetId)
      : "__none__");

  async function handleSave(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    await onUpdate({
      id: project.id,
      clientId: form.clientId === "__none__" ? null : Number(form.clientId),
      title: form.title || undefined,
      description: form.description || undefined,
      status: form.status,
      sourceLanguage: form.sourceLanguage || undefined,
      targetLanguage: form.targetLanguage || undefined,
      wordCount: parseNonNegative(form.wordCount) ?? undefined,
      currency: form.currency || undefined,
      fixedFee: parseNonNegative(form.fixedFee),
      hourlyRate: parseNonNegative(form.hourlyRate),
      perWordRate: parseNonNegative(form.perWordRate),
      useCustomRate: form.useCustomRate,
      rateSheetId:
        effectiveRateSheetId === "__none__"
          ? null
          : Number(effectiveRateSheetId),
      deadline: form.deadline || undefined,
      startDate: form.startDate || undefined,
      activityIds: form.activityIds,
    });
    setEditing(false);
  }

  const hourlyRates = [...userRates, ...clientRates].filter(
    (r) => r.type === "HOURLY",
  );
  const perWordRates = [...userRates, ...clientRates].filter(
    (r) => r.type === "PER_WORD",
  );
  const fixedRates = [...userRates, ...clientRates].filter(
    (r) => r.type === "FIXED",
  );

  if (editing) {
    return (
      <form onSubmit={handleSave} className="mb-6 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 flex flex-col gap-1">
            <Label htmlFor="pj-title">Title</Label>
            <Input
              id="pj-title"
              value={form.title}
              onChange={set("title")}
              required
            />
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <Label htmlFor="pj-description">Description</Label>
            <Input
              id="pj-description"
              value={form.description}
              onChange={set("description")}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="pj-status">Status</Label>
            <Select
              value={form.status}
              onValueChange={(val) =>
                setForm((prev) => ({ ...prev, status: val as ProjectStatus }))
              }
            >
              <SelectTrigger id="pj-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="pj-currency">Currency</Label>
            <Input
              id="pj-currency"
              value={form.currency}
              onChange={set("currency")}
              placeholder="EUR"
            />
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <Label htmlFor="pj-client">Client</Label>
            <Select value={form.clientId} onValueChange={handleClientChange}>
              <SelectTrigger id="pj-client">
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
          <div className="flex flex-col gap-1">
            <Label htmlFor="pj-src">Source language</Label>
            <Select
              value={form.sourceLanguage || "__none__"}
              onValueChange={(val) =>
                setForm((prev) => ({
                  ...prev,
                  sourceLanguage: val === "__none__" ? "" : val,
                }))
              }
            >
              <SelectTrigger id="pj-src">
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">—</SelectItem>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    {l.code} — {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="pj-tgt">Target language</Label>
            <Select
              value={form.targetLanguage || "__none__"}
              onValueChange={(val) =>
                setForm((prev) => ({
                  ...prev,
                  targetLanguage: val === "__none__" ? "" : val,
                }))
              }
            >
              <SelectTrigger id="pj-tgt">
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">—</SelectItem>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    {l.code} — {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="pj-start">Start date</Label>
            <Input
              id="pj-start"
              type="date"
              value={form.startDate}
              onChange={set("startDate")}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="pj-deadline">Deadline</Label>
            <Input
              id="pj-deadline"
              type="date"
              value={form.deadline}
              onChange={set("deadline")}
            />
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <Label htmlFor="pj-wc">Word count</Label>
            <Input
              id="pj-wc"
              type="number"
              min={0}
              value={form.wordCount}
              onChange={set("wordCount")}
            />
          </div>
          <div className="col-span-2 flex flex-col gap-2">
            <Label>Activities</Label>
            <ActivityChips
              activityIds={form.activityIds}
              activities={activities}
              onChange={(activityIds) =>
                setForm((prev) => ({ ...prev, activityIds }))
              }
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Monetization
            </p>
            <Separator className="flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="pj-custom-rate"
              checked={form.useCustomRate}
              onCheckedChange={(checked) =>
                setForm((prev) => ({
                  ...prev,
                  useCustomRate: checked === true,
                }))
              }
            />
            <Label htmlFor="pj-custom-rate" className="text-sm font-normal">
              Use custom rate for this project instead of the client&apos;s rate
              sheet
            </Label>
          </div>
          {!form.useCustomRate && (
            <div className="flex flex-col gap-1">
              <Label htmlFor="pj-rate-sheet">Client rate sheet</Label>
              {formClientRateSheets.length > 0 ? (
                <Select
                  value={effectiveRateSheetId}
                  onValueChange={(val) => {
                    // Radix can fire a spurious "" change when the item
                    // list underneath a controlled value swaps out (e.g.
                    // right after switching clients) — never a real
                    // selection, so ignore it.
                    if (!val) return;
                    setForm((prev) => ({ ...prev, rateSheetId: val }));
                  }}
                >
                  <SelectTrigger id="pj-rate-sheet">
                    <SelectValue placeholder="Select a rate sheet…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {formClientRateSheets.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name} — {s.pricePerWord} {s.currency}/word
                        {s.isDefault ? " (default)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {formClientId == null
                    ? "Select a client to choose a rate sheet."
                    : 'No rate sheets for this client yet. Add one in Rates, or check "Use custom rate" above.'}
                </p>
              )}
            </div>
          )}
          {form.useCustomRate && (
            <div className="grid grid-cols-2 gap-3">
              <p className="col-span-2 text-xs text-muted-foreground -mb-1">
                Leave blank to disable
              </p>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pj-fixed">Fixed fee</Label>
                  <RatePicker
                    allRates={fixedRates}
                    onPick={(amount, currency) =>
                      setForm((prev) => ({
                        ...prev,
                        fixedFee: String(amount),
                        currency,
                      }))
                    }
                  />
                </div>
                <Input
                  id="pj-fixed"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  value={form.fixedFee}
                  onChange={set("fixedFee")}
                />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pj-hourly">Hourly rate</Label>
                  <RatePicker
                    allRates={hourlyRates}
                    onPick={(amount, currency) =>
                      setForm((prev) => ({
                        ...prev,
                        hourlyRate: String(amount),
                        currency,
                      }))
                    }
                  />
                </div>
                <Input
                  id="pj-hourly"
                  type="number"
                  min={0}
                  step="0.0001"
                  placeholder="0.0000"
                  value={form.hourlyRate}
                  onChange={set("hourlyRate")}
                />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pj-word">Per-word rate</Label>
                  <RatePicker
                    allRates={perWordRates}
                    onPick={(amount, currency) =>
                      setForm((prev) => ({
                        ...prev,
                        perWordRate: String(amount),
                        currency,
                      }))
                    }
                  />
                </div>
                <Input
                  id="pj-word"
                  type="number"
                  min={0}
                  step="0.0001"
                  placeholder="0.0000"
                  value={form.perWordRate}
                  onChange={set("perWordRate")}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              resetForm();
              setEditing(false);
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  const client = clients.find((c) => c.id === project.clientId);

  const pricing = project.useCustomRate
    ? [
        project.fixedFee != null &&
          `Fixed ${project.fixedFee} ${project.currency}`,
        project.hourlyRate != null &&
          `${project.hourlyRate}/hr ${project.currency}`,
        project.perWordRate != null &&
          `${project.perWordRate}/word ${project.currency}`,
      ].filter(Boolean)
    : resolvedRateSheet
      ? [
          `Client rate: ${resolvedRateSheet.pricePerWord} ${resolvedRateSheet.currency}/word (${resolvedRateSheet.name})`,
        ]
      : ["No client rate sheet for this project"];

  return (
    <div className="mb-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">
              {client && (
                <>
                  <Link
                    to={`/clients/${client.id}`}
                    className="text-muted-foreground hover:text-foreground hover:underline"
                  >
                    {client.name}
                  </Link>
                  <span className="text-muted-foreground"> — </span>
                </>
              )}
              {project.title}
            </h1>
            <Badge
              variant={STATUS_VARIANTS[project.status] ?? "outline"}
              className={STATUS_BADGE_CLASSES[project.status]}
            >
              {project.status}
            </Badge>
            {project.sourceLanguage && project.targetLanguage && (
              <Badge variant="outline" className="font-mono">
                {project.sourceLanguage} → {project.targetLanguage}
              </Badge>
            )}
            {project.deadline && (
              <Badge variant="outline">
                Due {project.deadline.slice(0, 10)}
              </Badge>
            )}
            {project.wordCount != null ? (
              <Badge variant="outline">
                {(project.totalWordsProcessed ?? 0).toLocaleString()} /{" "}
                {project.wordCount.toLocaleString()} words
              </Badge>
            ) : (
              project.totalWordsProcessed != null &&
              project.totalWordsProcessed > 0 && (
                <Badge variant="outline">
                  {project.totalWordsProcessed.toLocaleString()} words logged
                </Badge>
              )
            )}
          </div>
          {pricing.length > 0 && (
            <p className="text-muted-foreground text-sm mt-0.5">
              {pricing.join(" + ")}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-blue-600 dark:border-blue-400 text-foreground hover:bg-blue-500/30 hover:text-foreground dark:hover:bg-blue-400/30 dark:hover:text-foreground"
          onClick={() => setEditing(true)}
        >
          Edit
        </Button>
      </div>
    </div>
  );
}
