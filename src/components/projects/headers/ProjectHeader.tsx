import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { TranslationRate } from "@/types/rates.types";
import type { ClientRate } from "@/types/client-rates.types";
import { useRates } from "@/hooks/rates/useRates";
import { useClientRates } from "@/hooks/clients/useClientRates";

const STATUSES: ProjectStatus[] = [
  "DRAFT",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
  "ARCHIVED",
  "INVOICE_SENT",
  "INVOICE_PAID",
];

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

export function ProjectHeader({
  project,
  clients,
  onUpdate,
  saving,
}: ProjectHeaderProps) {
  const { rates: userRates } = useRates();
  const clientIdNum = project.clientId;
  const { clientRates } = useClientRates(clientIdNum);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
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
    deadline: project.deadline?.slice(0, 10) ?? "",
    startDate: project.startDate?.slice(0, 10) ?? "",
  });

  function resetForm() {
    setForm({
      title: project.title,
      description: project.description ?? "",
      status: project.status,
      clientId:
        project.clientId != null ? String(project.clientId) : "__none__",
      sourceLanguage: project.sourceLanguage ?? "",
      targetLanguage: project.targetLanguage ?? "",
      wordCount: project.wordCount != null ? String(project.wordCount) : "",
      currency: project.currency ?? "EUR",
      fixedFee: project.fixedFee != null ? String(project.fixedFee) : "",
      hourlyRate: project.hourlyRate != null ? String(project.hourlyRate) : "",
      perWordRate:
        project.perWordRate != null ? String(project.perWordRate) : "",
      deadline: project.deadline?.slice(0, 10) ?? "",
      startDate: project.startDate?.slice(0, 10) ?? "",
    });
  }

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

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
      wordCount: form.wordCount ? Number(form.wordCount) : undefined,
      currency: form.currency || undefined,
      fixedFee: form.fixedFee ? Number(form.fixedFee) : null,
      hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : null,
      perWordRate: form.perWordRate ? Number(form.perWordRate) : null,
      deadline: form.deadline || undefined,
      startDate: form.startDate || undefined,
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
            <Select
              value={form.clientId}
              onValueChange={(val) =>
                setForm((prev) => ({ ...prev, clientId: val }))
              }
            >
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
            <Input
              id="pj-src"
              value={form.sourceLanguage}
              onChange={set("sourceLanguage")}
              placeholder="e.g. EN"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="pj-tgt">Target language</Label>
            <Input
              id="pj-tgt"
              value={form.targetLanguage}
              onChange={set("targetLanguage")}
              placeholder="e.g. FR"
            />
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
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Monetization
            </p>
            <Separator className="flex-1" />
            <p className="text-xs text-muted-foreground">
              Leave blank to disable
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
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

  const pricing = [
    project.fixedFee != null && `Fixed ${project.fixedFee} ${project.currency}`,
    project.hourlyRate != null &&
      `${project.hourlyRate}/hr ${project.currency}`,
    project.perWordRate != null &&
      `${project.perWordRate}/word ${project.currency}`,
  ].filter(Boolean);

  return (
    <div className="mb-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <Badge
              variant={project.status === "ACTIVE" ? "default" : "secondary"}
            >
              {project.status}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {[
              project.sourceLanguage &&
                project.targetLanguage &&
                `${project.sourceLanguage} → ${project.targetLanguage}`,
              project.deadline && `Due ${project.deadline.slice(0, 10)}`,
              project.wordCount &&
                `${project.wordCount.toLocaleString()} words`,
            ]
              .filter(Boolean)
              .join(" · ") || "No details"}
          </p>
          {pricing.length > 0 && (
            <p className="text-muted-foreground text-sm mt-0.5">
              {pricing.join(" + ")}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
          Edit
        </Button>
      </div>
    </div>
  );
}
