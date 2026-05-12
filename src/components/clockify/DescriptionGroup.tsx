import { useState } from "react";
import {
  type ClockifyTimeEntry,
  type ClockifyProject,
  type ClockifyTag,
  type UpdateEntryInput,
} from "../../hooks/useClockify";
import { secsToHms } from "./helpers";
import { EntryRow } from "./EntryRow";

export function DescriptionGroup({
  workspaceId,
  description,
  entries,
  projects,
  tags,
  onDelete,
  onResume,
  onUpdate,
}: {
  workspaceId: string;
  description: string;
  entries: ClockifyTimeEntry[];
  projects: ClockifyProject[];
  tags: ClockifyTag[];
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
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 text-xs w-3 shrink-0 transition-colors"
          aria-label={expanded ? "Collapse entries" : "Expand entries"}
        >
          {expanded ? "▼" : "▶"}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-zinc-900 dark:text-white truncate">
            {description || (
              <span className="italic text-zinc-400">No description</span>
            )}
          </p>
        </div>
        <span className="text-xs text-zinc-400 shrink-0">
          x{entries.length}
        </span>
        <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 ml-2 shrink-0">
          {secsToHms(totalSecs)}
        </span>
      </div>
      {expanded && (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
          {entries.map((entry) => (
            <EntryRow
              key={entry.id}
              workspaceId={workspaceId}
              entry={entry}
              projects={projects}
              tags={tags}
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
