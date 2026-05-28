import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  ClockifyProject,
  ClockifyTag,
  ClockifyTimeEntry,
  UpdateEntryInput,
} from "@/types/clockify.types";
import { TagChips } from "../tags/TagChips";
import { formatTime, secsToHms } from "../helpers";
import { ProjectSelect } from "../forms-inputs/ProjectSelect";
import { BillableToggle } from "../forms-inputs/BillableToggle";

export function EntryRow({
  workspaceId,
  entry,
  projects,
  tags,
  billabilityLocked,
  onDelete,
  onResume,
  onUpdate,
}: {
  workspaceId: string;
  entry: ClockifyTimeEntry;
  projects: ClockifyProject[];
  tags: ClockifyTag[];
  billabilityLocked: boolean;
  onDelete: (id: string) => void;
  onResume: (entry: ClockifyTimeEntry) => void;
  onUpdate: (input: UpdateEntryInput) => void;
}) {
  const start = entry.timeInterval.start;
  const end = entry.timeInterval.end;
  const durationSecs = end
    ? Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 1000)
    : 0;

  const [editingDesc, setEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState(entry.description ?? "");
  const descInputRef = useRef<HTMLInputElement>(null);

  function patch(
    partial: Partial<
      Pick<
        UpdateEntryInput,
        "projectId" | "billable" | "tagIds" | "description"
      >
    >,
  ) {
    onUpdate({
      entryId: entry.id,
      start: entry.timeInterval.start,
      end: entry.timeInterval.end ?? undefined,
      description:
        partial.description !== undefined
          ? partial.description
          : (entry.description ?? ""),
      projectId:
        partial.projectId !== undefined ? partial.projectId : entry.projectId,
      billable:
        partial.billable !== undefined ? partial.billable : entry.billable,
      tagIds:
        partial.tagIds !== undefined ? partial.tagIds : (entry.tagIds ?? []),
    });
  }

  function startEditDesc() {
    setDescValue(entry.description ?? "");
    setEditingDesc(true);
    setTimeout(() => descInputRef.current?.focus(), 0);
  }

  function commitDesc() {
    setEditingDesc(false);
    const trimmed = descValue.trim();
    if (trimmed !== (entry.description ?? "")) {
      patch({ description: trimmed });
    }
  }

  function handleDescKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") commitDesc();
    if (e.key === "Escape") setEditingDesc(false);
  }

  const entryTagIds = entry.tagIds ?? [];

  return (
    <div className="flex items-start gap-3 px-4 py-3">
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
            onClick={startEditDesc}
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
          <ProjectSelect
            projectId={entry.projectId}
            projects={projects}
            onChange={(id) => patch({ projectId: id })}
          />
          <TagChips
            workspaceId={workspaceId}
            tagIds={entryTagIds}
            tags={tags}
            onAdd={(id) => patch({ tagIds: [...entryTagIds, id] })}
            onRemove={(id) =>
              patch({ tagIds: entryTagIds.filter((t) => t !== id) })
            }
          />
          <BillableToggle
            billable={entry.billable}
            disabled={billabilityLocked}
            onChange={(v) => patch({ billable: v })}
          />
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
          <span>{formatTime(start)}</span>
          <span>–</span>
          {end ? (
            <span>{formatTime(end)}</span>
          ) : (
            <span className="text-primary">running</span>
          )}
          <span className="mx-0.5">·</span>
          <span>{end ? secsToHms(durationSecs) : "—"}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0 pt-1">
        <Button
          size="icon-xs"
          variant="ghost"
          onClick={() => onResume(entry)}
          aria-label="Resume entry"
          className="text-muted-foreground hover:text-emerald-600"
        >
          ▶
        </Button>
        <Button
          size="icon-xs"
          variant="ghost"
          onClick={() => onDelete(entry.id)}
          aria-label="Delete entry"
          className="text-muted-foreground hover:text-destructive"
        >
          ✕
        </Button>
      </div>
    </div>
  );
}
