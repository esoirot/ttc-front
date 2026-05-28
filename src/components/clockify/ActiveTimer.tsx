import { useEffect, useState } from "react";
import {
  useClockifyActiveEntry,
  useStartEntry,
  useStopEntry,
} from "../../hooks/integrations/useClockify";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { ClockifyProject, ClockifyTag } from "@/types/clockify.types";
import { DescriptionCombobox } from "../time/form-inputs/DescriptionCombobox";
import { TagChips } from "./tags/TagChips";
import { BillableToggle } from "./forms-inputs/BillableToggle";
import { ProjectSelect } from "./forms-inputs/ProjectSelect";

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
  billabilityLocked,
  recentDescriptions,
}: {
  workspaceId: string;
  projects: ClockifyProject[];
  tags: ClockifyTag[];
  billabilityLocked: boolean;
  recentDescriptions: string[];
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-lg border border-primary/20 bg-primary/5">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {active.description || (
              <span className="italic text-muted-foreground">
                No description
              </span>
            )}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {activeProject && (
              <span className="text-xs text-muted-foreground">
                {activeProject.name}
              </span>
            )}
            {activeTags.map((t) => (
              <Badge
                key={t.id}
                variant="secondary"
                className="text-xs px-1.5 py-0"
              >
                {t.name}
              </Badge>
            ))}
            {active.billable && (
              <span className="text-xs font-semibold text-emerald-600">$</span>
            )}
          </div>
          <p className="text-xs font-mono text-primary mt-0.5">{elapsed}</p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => stop()}
          disabled={stopping}
          className="shrink-0"
        >
          {stopping ? "Stopping…" : "Stop"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <Label htmlFor="at-description" className="sr-only">
          Description
        </Label>
        <DescriptionCombobox
          value={description}
          onChange={setDescription}
          onEnter={handleStart}
          recentDescriptions={recentDescriptions}
          className="flex-1"
        />
        <Button
          onClick={handleStart}
          disabled={starting}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
        >
          {starting ? "Starting…" : "Start"}
        </Button>
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
        <BillableToggle
          billable={billable}
          disabled={billabilityLocked}
          onChange={setBillable}
        />
      </div>
    </div>
  );
}
