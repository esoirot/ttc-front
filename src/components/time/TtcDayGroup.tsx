import { useState } from "react";
import type { TimeEntry } from "@/types/time-entries.types";
import type { Project } from "@/types/projects.types";
import type { Tag } from "@/types/tags.types";
import {
  formatTime,
  secsToHms,
  dayLabel,
  groupByDescription,
} from "./ttcHelpers";
import { TtcEntryRow } from "./TtcEntryRow";
import type { TtcUpdateInput } from "@/types/time-entries.types";
import { TtcDescriptionGroup } from "./TtcDescriptionGroup";
import { Button } from "@/components/ui/button";

export function TtcDayGroup({
  dayKey,
  entries,
  projects,
  tags,
  onDelete,
  onResume,
  onUpdate,
}: {
  dayKey: string;
  entries: TimeEntry[];
  projects: Project[];
  tags: Tag[];
  onDelete: (id: number) => void;
  onResume: (entry: TimeEntry) => void;
  onUpdate: (input: TtcUpdateInput) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const totalSecs = entries.reduce(
    (sum, e) => sum + (e.durationSeconds ?? 0),
    0,
  );

  const sortedStarts = entries.map((e) => e.startTime).sort();
  const sortedEnds = entries
    .map((e) => e.endTime)
    .filter((e): e is string => e !== null)
    .sort();
  const hasRunning = entries.some((e) => !e.endTime);

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
            {earliest} - {latest}
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
              <TtcEntryRow
                key={group[0].id}
                entry={group[0]}
                projects={projects}
                tags={tags}
                onDelete={onDelete}
                onResume={onResume}
                onUpdate={onUpdate}
              />
            ) : (
              <TtcDescriptionGroup
                key={key}
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
