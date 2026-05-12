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
      className="text-xs bg-transparent border border-border rounded px-1.5 py-0.5 text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
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
