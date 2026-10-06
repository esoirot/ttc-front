import { ProjectPicker } from "@/components/projects/pickers/ProjectPicker";
import { useState } from "react";
import { useIntl } from "react-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TimerStartInputProps as Props } from "@/types/shared-ui.types";
import { cn } from "@/lib/utils";
import { useStartTimer } from "@/hooks/time/useTimeEntries";
import { DescriptionCombobox } from "./DescriptionCombobox";
import { TtcTagChips } from "../tags/TtcTagChips";

export function TimerStartInput({
  tags,
  recentDescriptions,
  initialProjectId,
  initialTaskId,
  initialTaskTitle,
}: Props) {
  const intl = useIntl();
  const noProject = intl.formatMessage({
    id: "time.entryRow.noProject",
    defaultMessage: "No project",
  });
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
          {starting
            ? intl.formatMessage({
                id: "time.timerStartInput.starting",
                defaultMessage: "Starting…",
              })
            : intl.formatMessage({
                id: "time.timerStartInput.start",
                defaultMessage: "▶ Start",
              })}
        </Button>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        {initialTaskId != null && initialTaskTitle && (
          <Badge variant="secondary" className="text-xs font-normal">
            {intl.formatMessage(
              {
                id: "time.timerStartInput.task",
                defaultMessage: "Task: {title}",
              },
              { title: initialTaskTitle },
            )}
          </Badge>
        )}
        <ProjectPicker
          className="h-6 text-xs w-auto min-w-[100px] border-dashed"
          value={projectId ?? ""}
          onChange={(v) => setProjectId(v || null)}
          placeholder={noProject}
          noneLabel={noProject}
        />
        <TtcTagChips tagIds={tagIds} tags={tags} onChange={setTagIds} />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setBillable((b) => !b)}
          aria-label={intl.formatMessage({
            id: "time.entryRow.toggleBillable",
            defaultMessage: "Toggle billable",
          })}
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
