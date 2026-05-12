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
        <span className="text-xs text-zinc-500 dark:text-zinc-400">From:</span>
        <input
          type="date"
          value={startDate}
          max={endDate}
          onChange={(e) => {
            if (e.target.value) setStartDate(e.target.value);
          }}
          className="text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
        <span className="text-xs text-zinc-500 dark:text-zinc-400">To:</span>
        <input
          type="date"
          value={endDate}
          min={startDate}
          max={todayStr()}
          onChange={(e) => {
            if (e.target.value) setEndDate(e.target.value);
          }}
          className="text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
      </div>

      {projects.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Project:
          </span>
          <button
            onClick={() => setSelectedProject(null)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              selectedProject === null
                ? "bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            All
          </button>
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProject(p.id)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                selectedProject === p.id
                  ? "bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      <ActiveTimer workspaceId={workspaceId} projects={projects} tags={tags} />

      <div>
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
          Entries
        </h2>
        {grouped.length === 0 ? (
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            No entries yet.
          </p>
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
