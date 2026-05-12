import type { ClockifyProject } from "../../hooks/useClockify";

export function ProjectSelect({
  projectId,
  projects,
  onChange,
}: {
  projectId: string | null;
  projects: ClockifyProject[];
  onChange: (id: string | null) => void;
}) {
  return (
    <select
      value={projectId ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      className="text-xs bg-transparent border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 text-zinc-500 dark:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-violet-500"
    >
      <option value="">No project</option>
      {projects.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}
