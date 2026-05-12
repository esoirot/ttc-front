import { useEffect, useState } from "react";
import {
  useClockifyActiveEntry,
  useStartEntry,
  useStopEntry,
  type ClockifyProject,
  type ClockifyTag,
} from "../../hooks/useClockify";
import { BillableToggle } from "./BillableToggle";
import { ProjectSelect } from "./ProjectSelect";
import { TagChips } from "./TagChips";

function elapsedHms(startIso: string): string {
  const secs = Math.max(
    0,
    Math.floor((Date.now() - new Date(startIso).getTime()) / 1000),
  );
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

function useElapsed(startIso: string | null): string {
  const [display, setDisplay] = useState(
    startIso ? elapsedHms(startIso) : "00:00:00",
  );
  useEffect(() => {
    if (!startIso) return;
    const id = setInterval(() => setDisplay(elapsedHms(startIso)), 1000);
    return () => clearInterval(id);
  }, [startIso]);
  return display;
}

export function ActiveTimer({
  workspaceId,
  projects,
  tags,
}: {
  workspaceId: string;
  projects: ClockifyProject[];
  tags: ClockifyTag[];
}) {
  const { data: active } = useClockifyActiveEntry(workspaceId);
  const { mutate: start, isPending: starting } = useStartEntry(workspaceId);
  const { mutate: stop, isPending: stopping } = useStopEntry(workspaceId);
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [billable, setBillable] = useState(false);
  const elapsed = useElapsed(active?.timeInterval.start ?? null);

  function handleStart() {
    start({
      description: description.trim(),
      projectId: projectId ?? undefined,
      tagIds,
      billable,
    });
    setDescription("");
    setTagIds([]);
  }

  if (active) {
    const activeProject = active.projectId
      ? projects.find((p) => p.id === active.projectId)
      : null;
    const activeTags = (active.tagIds ?? [])
      .map((id) => tags.find((t) => t.id === id))
      .filter((t): t is ClockifyTag => t !== undefined);

    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
            {active.description || (
              <span className="italic text-zinc-400">No description</span>
            )}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {activeProject && (
              <span className="text-xs text-zinc-500">
                {activeProject.name}
              </span>
            )}
            {activeTags.map((t) => (
              <span
                key={t.id}
                className="text-xs px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
              >
                {t.name}
              </span>
            ))}
            {active.billable && (
              <span className="text-xs font-semibold text-emerald-600">$</span>
            )}
          </div>
          <p className="text-xs font-mono text-violet-600 dark:text-violet-400 mt-0.5">
            {elapsed}
          </p>
        </div>
        <button
          onClick={() => stop()}
          disabled={stopping}
          className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors shrink-0"
        >
          {stopping ? "Stopping…" : "Stop"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleStart();
          }}
          placeholder="What are you working on?"
          className="flex-1 px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <button
          onClick={handleStart}
          disabled={starting}
          className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors shrink-0"
        >
          {starting ? "Starting…" : "Start"}
        </button>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <ProjectSelect
          projectId={projectId}
          projects={projects}
          onChange={setProjectId}
        />
        <TagChips
          workspaceId={workspaceId}
          tagIds={tagIds}
          tags={tags}
          onAdd={(id) => setTagIds((prev) => [...prev, id])}
          onRemove={(id) => setTagIds((prev) => prev.filter((t) => t !== id))}
        />
        <BillableToggle billable={billable} onChange={setBillable} />
      </div>
    </div>
  );
}
