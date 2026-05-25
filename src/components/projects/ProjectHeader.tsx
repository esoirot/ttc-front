import { useState } from "react";
import { Badge } from "@/components/ui/badge";
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
import type { Project, ProjectStatus } from "../../hooks/projects/useProjects";

const STATUSES: ProjectStatus[] = [
  "DRAFT",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
  "ARCHIVED",
  "INVOICE_SENT",
  "INVOICE_PAID",
];

interface ProjectHeaderProps {
  project: Project;
  onUpdate: (input: {
    id: number;
    title?: string;
    description?: string;
    status?: ProjectStatus;
    sourceLanguage?: string;
    targetLanguage?: string;
    wordCount?: number;
    unitPrice?: number;
    currency?: string;
    deadline?: string;
    startDate?: string;
  }) => Promise<unknown>;
  saving: boolean;
}

export function ProjectHeader({
  project,
  onUpdate,
  saving,
}: ProjectHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: project.title,
    description: project.description ?? "",
    status: project.status,
    sourceLanguage: project.sourceLanguage ?? "",
    targetLanguage: project.targetLanguage ?? "",
    wordCount: project.wordCount != null ? String(project.wordCount) : "",
    unitPrice: project.unitPrice != null ? String(project.unitPrice) : "",
    currency: project.currency ?? "EUR",
    deadline: project.deadline?.slice(0, 10) ?? "",
    startDate: project.startDate?.slice(0, 10) ?? "",
  });

  function resetForm() {
    setForm({
      title: project.title,
      description: project.description ?? "",
      status: project.status,
      sourceLanguage: project.sourceLanguage ?? "",
      targetLanguage: project.targetLanguage ?? "",
      wordCount: project.wordCount != null ? String(project.wordCount) : "",
      unitPrice: project.unitPrice != null ? String(project.unitPrice) : "",
      currency: project.currency ?? "EUR",
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
      title: form.title || undefined,
      description: form.description || undefined,
      status: form.status,
      sourceLanguage: form.sourceLanguage || undefined,
      targetLanguage: form.targetLanguage || undefined,
      wordCount: form.wordCount ? Number(form.wordCount) : undefined,
      unitPrice: form.unitPrice ? Number(form.unitPrice) : undefined,
      currency: form.currency || undefined,
      deadline: form.deadline || undefined,
      startDate: form.startDate || undefined,
    });
    setEditing(false);
  }

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
            <Label htmlFor="pj-wc">Word count</Label>
            <Input
              id="pj-wc"
              type="number"
              min={0}
              value={form.wordCount}
              onChange={set("wordCount")}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="pj-up">Unit price</Label>
            <Input
              id="pj-up"
              type="number"
              min={0}
              step="0.0001"
              value={form.unitPrice}
              onChange={set("unitPrice")}
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
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
          Edit
        </Button>
      </div>
    </div>
  );
}
