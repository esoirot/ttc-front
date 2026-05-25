import { useState, useRef } from "react";
import type { TimeEntry } from "../../hooks/time/useTimeEntries";
import type { Project } from "../../hooks/projects/useProjects";
import { formatTime, secsToHms } from "./ttcHelpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type TtcUpdateInput = {
  id: number;
  description?: string;
  billable?: boolean;
  projectId?: number | null;
};

export function TtcEntryRow({
  entry,
  projects,
  onDelete,
  onResume,
  onUpdate,
}: {
  entry: TimeEntry;
  projects: Project[];
  onDelete: (id: number) => void;
  onResume: (entry: TimeEntry) => void;
  onUpdate: (input: TtcUpdateInput) => void;
}) {
  const [editingDesc, setEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState(entry.description ?? "");
  const [editingProject, setEditingProject] = useState(false);
  const descInputRef = useRef<HTMLInputElement>(null);

  const project = projects.find((p) => p.id === entry.projectId) ?? null;

  function startEditDesc() {
    setDescValue(entry.description ?? "");
    setEditingDesc(true);
    setTimeout(() => descInputRef.current?.focus(), 0);
  }

  function commitDesc() {
    setEditingDesc(false);
    const trimmed = descValue.trim();
    if (trimmed !== (entry.description ?? "")) {
      onUpdate({ id: entry.id, description: trimmed });
    }
  }

  function handleDescKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") commitDesc();
    if (e.key === "Escape") setEditingDesc(false);
  }

  return (
    <div
      className="flex items-start gap-3 px-4 py-3"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        {editingDesc ? (
          <Input
            ref={descInputRef}
            value={descValue}
            onChange={(e) => setDescValue(e.target.value)}
            onBlur={commitDesc}
            onKeyDown={handleDescKey}
            className="h-7 text-sm"
            placeholder="Description"
          />
        ) : (
          <p
            className="text-sm truncate cursor-text hover:text-foreground/80"
            onClick={(e) => {
              e.stopPropagation();
              startEditDesc();
            }}
            title="Click to edit description"
          >
            {entry.description || (
              <span className="italic text-muted-foreground">
                No description
              </span>
            )}
          </p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          {editingProject ? (
            <Select
              open
              onOpenChange={(o) => !o && setEditingProject(false)}
              value={
                entry.projectId != null ? String(entry.projectId) : "__none__"
              }
              onValueChange={(v) => {
                onUpdate({
                  id: entry.id,
                  projectId: v === "__none__" ? null : Number(v),
                });
                setEditingProject(false);
              }}
            >
              <SelectTrigger className="h-6 text-xs w-[160px]">
                <SelectValue placeholder="No project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No project</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setEditingProject(true);
              }}
              className={cn(
                "h-5 px-1.5 text-xs font-normal",
                !project && "text-muted-foreground border-dashed",
              )}
              title="Edit project"
            >
              {project?.title ?? "No project"}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ id: entry.id, billable: !entry.billable });
            }}
            aria-label="Toggle billable"
            className={cn(
              "h-5 px-1.5 text-xs font-mono",
              entry.billable
                ? "border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100"
                : "text-muted-foreground",
            )}
          >
            $
          </Button>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
          <span>{formatTime(entry.startTime)}</span>
          <span>-</span>
          {entry.endTime ? (
            <span>{formatTime(entry.endTime)}</span>
          ) : (
            <span className="text-primary">running</span>
          )}
          <span className="mx-0.5">·</span>
          <span>
            {entry.durationSeconds != null
              ? secsToHms(entry.durationSeconds)
              : "—"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0 pt-1">
        <Button
          size="icon-xs"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onResume(entry);
          }}
          aria-label="Resume entry"
          className="text-muted-foreground hover:text-emerald-600"
        >
          ▶
        </Button>
        <Button
          size="icon-xs"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(entry.id);
          }}
          aria-label="Delete entry"
          className="text-muted-foreground hover:text-destructive"
        >
          ✕
        </Button>
      </div>
    </div>
  );
}
