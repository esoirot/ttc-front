import { useState } from "react";
import type { TimeEntry } from "../../hooks/time/useTimeEntries";
import type { Project } from "../../hooks/projects/useProjects";
import { secsToHms } from "./ttcHelpers";
import { TtcEntryRow, type TtcUpdateInput } from "./TtcEntryRow";
import { Button } from "@/components/ui/button";

export function TtcDescriptionGroup({
  description,
  entries,
  projects,
  onDelete,
  onResume,
  onUpdate,
}: {
  description: string;
  entries: TimeEntry[];
  projects: Project[];
  onDelete: (id: number) => void;
  onResume: (entry: TimeEntry) => void;
  onUpdate: (input: TtcUpdateInput) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const totalSecs = entries.reduce(
    (sum, e) => sum + (e.durationSeconds ?? 0),
    0,
  );

  return (
    <div>
      <Button
        variant="ghost"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-4 py-2.5 rounded-none h-auto justify-start hover:bg-accent/50"
      >
        <span className="text-muted-foreground text-xs w-3 shrink-0">
          {expanded ? "▼" : "▶"}
        </span>
        <span className="text-sm truncate flex-1 text-left">
          {description || (
            <span className="italic text-muted-foreground">No description</span>
          )}
        </span>
        <span className="text-xs text-muted-foreground shrink-0">
          ×{entries.length}
        </span>
        <span className="text-xs font-mono text-foreground ml-2 shrink-0">
          {secsToHms(totalSecs)}
        </span>
      </Button>
      {expanded && (
        <div
          className="divide-y divide-border"
          onClick={(e) => e.stopPropagation()}
        >
          {entries.map((entry) => (
            <TtcEntryRow
              key={entry.id}
              entry={entry}
              projects={projects}
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
