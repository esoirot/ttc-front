import { useState } from "react";
import {
  type ClockifyTimeEntry,
  type ClockifyProject,
  type ClockifyTag,
  type UpdateEntryInput,
} from "../../hooks/useClockify";
import { formatTime, secsToHms, dayLabel, groupByDescription } from "./helpers";
import { EntryRow } from "./EntryRow";
import { DescriptionGroup } from "./DescriptionGroup";

export function DayGroup({
  workspaceId,
  dayKey,
  entries,
  projects,
  tags,
  onDelete,
  onResume,
  onUpdate,
}: {
  workspaceId: string;
  dayKey: string;
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

  const sortedStarts = entries.map((e) => e.timeInterval.start).sort();
  const sortedEnds = entries
    .map((e) => e.timeInterval.end)
    .filter((e): e is string => e !== null)
    .sort();
  const hasRunning = entries.some((e) => !e.timeInterval.end);

  const earliest = sortedStarts[0] ? formatTime(sortedStarts[0]) : "";
  const latest =
    sortedEnds.length > 0
      ? formatTime(sortedEnds[sortedEnds.length - 1])
      : hasRunning
        ? "running"
        : "";

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors text-left"
      >
        <span className="text-zinc-400 text-xs w-3 shrink-0">
          {expanded ? "▼" : "▶"}
        </span>
        <span className="font-medium text-sm text-zinc-900 dark:text-white">
          {dayLabel(dayKey)}
        </span>
        <span className="text-xs text-zinc-400">({entries.length})</span>
        <div className="flex-1" />
        {!expanded && earliest && (
          <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
            {earliest} – {latest}
          </span>
        )}
        <span className="text-xs font-mono text-zinc-600 dark:text-zinc-300 ml-3 shrink-0">
          {secsToHms(totalSecs)}
        </span>
      </button>
      {expanded && (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {groupByDescription(entries).map(([key, group]) => {
            const desc = group[0].description?.trim() ?? "";
            return group.length === 1 ? (
              <EntryRow
                key={group[0].id}
                workspaceId={workspaceId}
                entry={group[0]}
                projects={projects}
                tags={tags}
                onDelete={onDelete}
                onResume={onResume}
                onUpdate={onUpdate}
              />
            ) : (
              <DescriptionGroup
                key={key}
                workspaceId={workspaceId}
                description={desc}
                entries={group}
                projects={projects}
                tags={tags}
                onDelete={onDelete}
                onResume={onResume}
                onUpdate={onUpdate}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
