import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TimerStartInputProps as Props } from "@/types/shared-ui.types";
import { cn } from "@/lib/utils";
import { useStartTimer } from "@/hooks/time/useTimeEntries";
import { DescriptionCombobox } from "./DescriptionCombobox";
import { TtcTagChips } from "../tags/TtcTagChips";

export function TimerStartInput({
  projects,
  tags,
  recentDescriptions,
  initialProjectId,
  initialTaskId,
  initialTaskTitle,
}: Props) {
  const { startTimer, loading: starting } = useStartTimer();
  const [desc, setDesc] = useState("");
  const [projectId, setProjectId] = useState<string | null>(
    initialProjectId != null ? String(initialProjectId) : null,
  );
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [billable, setBillable] = useState(true);

  function handleStart() {
    void startTimer({
      description: desc.trim() || undefined,
      projectId: projectId != null ? Number(projectId) : undefined,
      taskId: initialTaskId ?? undefined,
      billable,
      tagIds: tagIds.length ? tagIds : undefined,
    });
    setDesc("");
    setTagIds([]);
  }

  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className="flex gap-2">
        <DescriptionCombobox
          value={desc}
          onChange={setDesc}
          onEnter={handleStart}
          recentDescriptions={recentDescriptions}
          className="flex-1"
        />
        <Button onClick={handleStart} disabled={starting}>
          {starting ? "Starting…" : "▶ Start"}
        </Button>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        {initialTaskId != null && initialTaskTitle && (
          <Badge variant="secondary" className="text-xs font-normal">
            Task: {initialTaskTitle}
          </Badge>
        )}
        <Select
          value={projectId ?? "__none__"}
          onValueChange={(v) => setProjectId(v === "__none__" ? null : v)}
        >
          <SelectTrigger className="h-6 text-xs w-auto min-w-[100px] border-dashed">
            <SelectValue placeholder="No project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">No project</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <TtcTagChips
          tagIds={tagIds}
          tags={tags}
          onAdd={(id) => setTagIds((prev) => [...prev, id])}
          onRemove={(id) => setTagIds((prev) => prev.filter((t) => t !== id))}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setBillable((b) => !b)}
          aria-label="Toggle billable"
          className={cn(
            "h-5 px-1.5 text-xs font-mono",
            billable
              ? "border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950"
              : "text-muted-foreground",
          )}
        >
          $
        </Button>
      </div>
    </div>
  );
}
