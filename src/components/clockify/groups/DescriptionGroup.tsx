import { useState } from "react";
import { Button } from "@/components/ui/button";
import type {
  ClockifyProject,
  ClockifyTag,
  ClockifyTimeEntry,
  UpdateEntryInput,
} from "@/types/clockify.types";
import { secsToHms } from "../helpers";
import { EntryRow } from "../rows/EntryRow";

export function DescriptionGroup({
  workspaceId,
  description,
  entries,
  projects,
  tags,
  billabilityLocked,
  onDelete,
  onResume,
  onUpdate,
}: {
  workspaceId: string;
  description: string;
  entries: ClockifyTimeEntry[];
  projects: ClockifyProject[];
  tags: ClockifyTag[];
  billabilityLocked: boolean;
  onDelete: (id: string) => void;
  onResume: (entry: ClockifyTimeEntry) => void;
  onUpdate: (input: UpdateEntryInput) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const totalSecs = entries.reduce((sum, e) => {
    if (!e.timeInterval.end) return sum;
    return (
      sum +
      Math.floor(
        (new Date(e.timeInterval.end).getTime() -
          new Date(e.timeInterval.start).getTime()) /
          1000,
      )
    );
  }, 0);

  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-3">
        <Button
          size="icon-xs"
          variant="ghost"
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? "Collapse entries" : "Expand entries"}
          className="text-muted-foreground shrink-0"
        >
          {expanded ? "▼" : "▶"}
        </Button>
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate">
            {description || (
              <span className="italic text-muted-foreground">
                No description
              </span>
            )}
          </p>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">
          x{entries.length}
        </span>
        <span className="text-xs font-mono text-muted-foreground ml-2 shrink-0">
          {secsToHms(totalSecs)}
        </span>
      </div>
      {expanded && (
        <div className="divide-y divide-border border-t bg-muted/30">
          {entries.map((entry) => (
            <EntryRow
              key={entry.id}
              workspaceId={workspaceId}
              entry={entry}
              projects={projects}
              tags={tags}
              billabilityLocked={billabilityLocked}
              onDelete={onDelete}
              onResume={onResume}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
