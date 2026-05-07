import { useState, useEffect } from "react";
import {
  useClockifyStatus,
  useSetClockifyCredentials,
  useSetClockifyWorkspace,
  useClockifyWorkspaces,
  useClockifyProjects,
  useClockifyEntries,
  useClockifyActiveEntry,
  useStartEntry,
  useStopEntry,
  useDeleteEntry,
  type ClockifyTimeEntry,
} from "../hooks/useClockify";

function formatDuration(startIso: string): string {
  const diff = Math.max(
    0,
    Math.floor((Date.now() - new Date(startIso).getTime()) / 1000),
  );
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

function useElapsed(startIso: string | null): string {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!startIso) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [startIso]);

  return startIso ? formatDuration(startIso) : "00:00:00";
}

function ConnectForm() {
  const [apiKey, setApiKey] = useState("");
  const { mutate: save, isPending, error } = useSetClockifyCredentials();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey.trim()) return;
    save({ apiKey: apiKey.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Clockify API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Clockify API key"
          className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Find it in Clockify → Profile → API key
        </p>
      </div>
      {error && <p className="text-sm text-red-600">{error.message}</p>}
      <button
        type="submit"
        disabled={isPending || !apiKey.trim()}
        className="px-4 py-2 rounded-md bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? "Connecting…" : "Connect Clockify"}
      </button>
    </form>
  );
}

function WorkspacePicker() {
  const { data: workspaces, isLoading } = useClockifyWorkspaces();
  const { mutate: setWorkspace, isPending } = useSetClockifyWorkspace();

  if (isLoading)
    return <p className="text-sm text-zinc-500">Loading workspaces…</p>;

  return (
    <div className="flex flex-col gap-3 max-w-sm">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Select your default workspace:
      </p>
      {(workspaces ?? []).map((ws) => (
        <button
          key={ws.id}
          onClick={() => setWorkspace(ws.id)}
          disabled={isPending}
          className="px-4 py-3 rounded-md border border-zinc-200 dark:border-zinc-700 text-left text-sm font-medium text-zinc-900 dark:text-white hover:border-violet-500 hover:text-violet-600 disabled:opacity-50 transition-colors"
        >
          {ws.name}
        </button>
      ))}
    </div>
  );
}

function EntryRow({
  entry,
  onDelete,
  projects,
}: {
  entry: ClockifyTimeEntry;
  onDelete: (id: string) => void;
  projects: { id: string; name: string }[];
}) {
  const project = entry.projectId
    ? projects.find((p) => p.id === entry.projectId)
    : null;
  const start = entry.timeInterval.start;
  const end = entry.timeInterval.end;
  const duration = end
    ? (() => {
        const secs = Math.floor(
          (new Date(end).getTime() - new Date(start).getTime()) / 1000,
        );
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
      })()
    : "—";

  return (
    <div className="flex items-center gap-3 py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-900 dark:text-white truncate">
          {entry.description || (
            <span className="text-zinc-400 italic">No description</span>
          )}
        </p>
        {project && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {project.name}
          </p>
        )}
      </div>
      <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 shrink-0">
        {duration}
      </span>
      <button
        onClick={() => onDelete(entry.id)}
        className="text-zinc-400 hover:text-red-600 transition-colors text-xs shrink-0"
        aria-label="Delete entry"
      >
        ✕
      </button>
    </div>
  );
}

function ActiveTimer({
  workspaceId,
  projectId,
}: {
  workspaceId: string;
  projectId: string | null;
}) {
  const { data: active } = useClockifyActiveEntry(workspaceId);
  const { mutate: start, isPending: starting } = useStartEntry(workspaceId);
  const { mutate: stop, isPending: stopping } = useStopEntry(workspaceId);
  const [description, setDescription] = useState("");
  const elapsed = useElapsed(active?.timeInterval.start ?? null);

  function handleStart() {
    start({
      description: description.trim(),
      projectId: projectId ?? undefined,
    });
    setDescription("");
  }

  if (active) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
            {active.description || (
              <span className="italic text-zinc-400">No description</span>
            )}
          </p>
          <p className="text-xs font-mono text-violet-600 dark:text-violet-400 mt-0.5">
            {elapsed}
          </p>
        </div>
        <button
          onClick={() => stop(active.id)}
          disabled={stopping}
          className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors shrink-0"
        >
          {stopping ? "Stopping…" : "Stop"}
        </button>
      </div>
    );
  }

  return (
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
  );
}

function TrackerView({ workspaceId }: { workspaceId: string }) {
  const { data: projects = [] } = useClockifyProjects(workspaceId);
  const { data: entries = [] } = useClockifyEntries(workspaceId);
  const { mutate: deleteEntry } = useDeleteEntry(workspaceId);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      {/* Project filter row */}
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

      {/* Active timer */}
      <ActiveTimer workspaceId={workspaceId} projectId={selectedProject} />

      {/* Recent entries */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
          Recent entries
        </h2>
        {entries.length === 0 ? (
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            No entries yet.
          </p>
        ) : (
          <div>
            {entries
              .filter(
                (e) => !selectedProject || e.projectId === selectedProject,
              )
              .slice(0, 20)
              .map((entry) => (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  onDelete={deleteEntry}
                  projects={projects}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function TimeTrackerPage() {
  const { data: status, isLoading } = useClockifyStatus();

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <p className="text-sm text-zinc-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">
        Time Tracker
      </h1>

      {!status?.connected ? (
        <>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            Connect your Clockify account to start tracking time.
          </p>
          <ConnectForm />
        </>
      ) : !status.workspaceId ? (
        <>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            Choose a workspace to track time in.
          </p>
          <WorkspacePicker />
        </>
      ) : (
        <TrackerView workspaceId={status.workspaceId} />
      )}

      {status?.connected && (
        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <details className="text-xs text-zinc-400">
            <summary className="cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300">
              Update API key or workspace
            </summary>
            <div className="mt-4">
              <ConnectForm />
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
