import { useState } from "react";
import { DescriptionGroup } from "./DescriptionGroup";
import { Button } from "@/components/ui/button";
import type {
  ClockifyProject,
  ClockifyTag,
  ClockifyTimeEntry,
  UpdateEntryInput,
} from "@/types/clockify.types";
import {
  dayLabel,
  formatTime,
  groupByDescription,
  secsToHms,
} from "../helpers";
import { EntryRow } from "../rows/EntryRow";

export function DayGroup({
  workspaceId,
  dayKey,
  entries,
  projects,
  tags,
  billabilityLocked,
  onDelete,
  onResume,
  onUpdate,
}: {
  workspaceId: string;
  dayKey: string;
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
    <div className="border border-border rounded-lg overflow-hidden">
      <Button
        variant="ghost"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-4 py-3 rounded-none bg-muted/50 hover:bg-muted h-auto justify-start"
      >
        <span className="text-muted-foreground text-xs w-3 shrink-0">
          {expanded ? "▼" : "▶"}
        </span>
        <span className="font-medium text-sm">{dayLabel(dayKey)}</span>
        <span className="text-xs text-muted-foreground">
          ({entries.length})
        </span>
        <div className="flex-1" />
        {!expanded && earliest && (
          <span className="text-xs font-mono text-muted-foreground">
            {earliest} – {latest}
          </span>
        )}
        <span className="text-xs font-mono text-foreground ml-3 shrink-0">
          {secsToHms(totalSecs)}
        </span>
      </Button>
      {expanded && (
        <div className="divide-y divide-border">
          {groupByDescription(entries).map(([key, group]) => {
            const desc = group[0].description?.trim() ?? "";
            return group.length === 1 ? (
              <EntryRow
                key={group[0].id}
                workspaceId={workspaceId}
                entry={group[0]}
                projects={projects}
                tags={tags}
                billabilityLocked={billabilityLocked}
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
                billabilityLocked={billabilityLocked}
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
