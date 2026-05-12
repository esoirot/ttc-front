import { useState } from "react";
import {
  useClockifyProjects,
  useClockifyEntries,
  useClockifyTags,
  useDeleteEntry,
  useStartEntry,
  useUpdateEntry,
  type ClockifyTimeEntry,
  type UpdateEntryInput,
} from "../../hooks/useClockify";
import {
  groupByDay,
  todayStr,
  daysAgoStr,
  toStartIso,
  toEndIso,
} from "./helpers";
import { ActiveTimer } from "./ActiveTimer";
import { DayGroup } from "./DayGroup";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TrackerView({ workspaceId }: { workspaceId: string }) {
  const [startDate, setStartDate] = useState(() => daysAgoStr(30));
  const [endDate, setEndDate] = useState(() => todayStr());
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const { data: projects = [] } = useClockifyProjects(workspaceId);
  const { data: entries = [] } = useClockifyEntries(
    workspaceId,
    toStartIso(startDate),
    toEndIso(endDate),
  );
  const { data: tags = [] } = useClockifyTags(workspaceId);
  const { mutate: deleteEntry } = useDeleteEntry(workspaceId);
  const { mutate: startEntry } = useStartEntry(workspaceId);
  const { mutate: updateEntry } = useUpdateEntry(workspaceId);

  const visible = selectedProject
    ? entries.filter((e) => e.projectId === selectedProject)
    : entries;

  const grouped = groupByDay(visible);

  function handleResume(entry: ClockifyTimeEntry) {
    startEntry({
      description: entry.description ?? undefined,
      projectId: entry.projectId ?? undefined,
      tagIds: entry.tagIds ?? [],
      billable: entry.billable,
    });
  }

  function handleUpdate(input: UpdateEntryInput) {
    updateEntry(input);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs text-muted-foreground">From:</span>
        <input
          type="date"
          value={startDate}
          max={endDate}
          onChange={(e) => {
            if (e.target.value) setStartDate(e.target.value);
          }}
          className="text-xs rounded border border-border bg-background text-foreground px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <span className="text-xs text-muted-foreground">To:</span>
        <input
          type="date"
          value={endDate}
          min={startDate}
          max={todayStr()}
          onChange={(e) => {
            if (e.target.value) setEndDate(e.target.value);
          }}
          className="text-xs rounded border border-border bg-background text-foreground px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {projects.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Project:</span>
          <Button
            size="xs"
            variant="ghost"
            onClick={() => setSelectedProject(null)}
            className={cn(
              "text-xs",
              selectedProject === null
                ? "bg-primary/10 text-primary hover:bg-primary/10"
                : "text-muted-foreground",
            )}
          >
            All
          </Button>
          {projects.map((p) => (
            <Button
              key={p.id}
              size="xs"
              variant="ghost"
              onClick={() => setSelectedProject(p.id)}
              className={cn(
                "text-xs",
                selectedProject === p.id
                  ? "bg-primary/10 text-primary hover:bg-primary/10"
                  : "text-muted-foreground",
              )}
            >
              {p.name}
            </Button>
          ))}
        </div>
      )}

      <ActiveTimer workspaceId={workspaceId} projects={projects} tags={tags} />

      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Entries
        </h2>
        {grouped.length === 0 ? (
          <p className="text-sm text-muted-foreground">No entries yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {grouped.map(([day, dayEntries]) => (
              <DayGroup
                key={day}
                workspaceId={workspaceId}
                dayKey={day}
                entries={dayEntries}
                projects={projects}
                tags={tags}
                onDelete={deleteEntry}
                onResume={handleResume}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
