import type { ClockifyProject } from "../../hooks/integrations/useClockify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <Select
      value={projectId ?? "__none__"}
      onValueChange={(val) => onChange(val === "__none__" ? null : val)}
    >
      <SelectTrigger size="sm" className="w-fit text-muted-foreground">
        <SelectValue placeholder="No project" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__none__">No project</SelectItem>
        {projects.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
