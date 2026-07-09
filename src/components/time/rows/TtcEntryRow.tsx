import { useState, useRef } from "react";
import type { TimeEntry } from "@/types/time-entries.types";
import type { Project } from "@/types/projects.types";
import type { Tag } from "@/types/tags.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import type { TtcUpdateInput } from "@/types/time-entries.types";
import { TtcTagChips } from "../tags/TtcTagChips";
import { EditableTimeField } from "../EditableTimeField";
import { secsToHms } from "../ttcHelpers";
import { useTasks, useTask } from "@/hooks/tasks/useTasks";

export function TtcEntryRow({
  entry,
  projects,
  tags,
  onDelete,
  onResume,
  onUpdate,
  stackedTime = false,
}: {
  entry: TimeEntry;
  projects: Project[];
  tags: Tag[];
  onDelete: (id: number) => void;
  onResume?: (entry: TimeEntry) => void;
  onUpdate: (input: TtcUpdateInput) => void;
  /** Stack start/end/duration on 3 labeled lines instead of 1 — used in the cramped task modal sidebar. */
  stackedTime?: boolean;
}) {
  const [editingDesc, setEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState(entry.description ?? "");
  const [editingProject, setEditingProject] = useState(false);
  const [editingTask, setEditingTask] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState(false);
  const descInputRef = useRef<HTMLInputElement>(null);

  const project = projects.find((p) => p.id === entry.projectId) ?? null;
  const { tasks } = useTasks(entry.projectId ?? 0, {
    enabled: editingTask && entry.projectId != null,
  });
  const { task: taskDetail } = useTask(entry.taskId ?? 0, {
    enabled: editingSubtask && entry.taskId != null,
  });
  const subtasks = taskDetail?.subtasks ?? [];

  function startEditDesc() {
    setDescValue(entry.description ?? "");
    setEditingDesc(true);
    setTimeout(() => descInputRef.current?.focus(), 0);
  }

  function commitDesc() {
    setEditingDesc(false);
    const trimmed = descValue.trim();
    if (trimmed !== (entry.description ?? "")) {
      onUpdate({ id: entry.id, description: trimmed });
    }
  }

  function handleDescKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") commitDesc();
    if (e.key === "Escape") setEditingDesc(false);
  }

  return (
    <div
      className="flex items-start gap-3 px-4 py-3"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        {editingDesc ? (
          <Input
            ref={descInputRef}
            value={descValue}
            onChange={(e) => setDescValue(e.target.value)}
            onBlur={commitDesc}
            onKeyDown={handleDescKey}
            className="h-7 text-sm"
            placeholder="Description"
          />
        ) : (
          <p
            className="text-sm truncate cursor-text hover:text-foreground/80"
            onClick={(e) => {
              e.stopPropagation();
              startEditDesc();
            }}
            title="Click to edit description"
          >
            {entry.description || (
              <span className="italic text-muted-foreground">
                No description
              </span>
            )}
          </p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          {editingProject ? (
            <Select
              open
              onOpenChange={(o) => !o && setEditingProject(false)}
              value={
                entry.projectId != null ? String(entry.projectId) : "__none__"
              }
              onValueChange={(v) => {
                onUpdate({
                  id: entry.id,
                  projectId: v === "__none__" ? null : Number(v),
                  taskId: null,
                  subtaskId: null,
                });
                setEditingProject(false);
              }}
            >
              <SelectTrigger className="h-6 text-xs w-[160px]">
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
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setEditingProject(true);
              }}
              className={cn(
                "h-5 px-1.5 text-xs font-normal",
                project
                  ? "bg-orange-600 text-white border-orange-600 hover:bg-orange-700 hover:border-orange-700"
                  : "text-muted-foreground border-dashed",
              )}
              title="Edit project"
            >
              {project?.title ?? "No project"}
            </Button>
          )}
          {entry.projectId != null &&
            (editingTask ? (
              <Select
                open
                onOpenChange={(o) => !o && setEditingTask(false)}
                value={entry.taskId != null ? String(entry.taskId) : "__none__"}
                onValueChange={(v) => {
                  if (v === "__none__") {
                    onUpdate({ id: entry.id, taskId: null, subtaskId: null });
                  } else {
                    const selected = tasks.find((t) => t.id === Number(v));
                    const needsDesc = !entry.description?.trim();
                    const autoDesc =
                      selected && needsDesc
                        ? project
                          ? `Task ${selected.title} of project ${project.title}`
                          : selected.title
                        : null;
                    onUpdate({
                      id: entry.id,
                      taskId: Number(v),
                      ...(autoDesc ? { description: autoDesc } : {}),
                    });
                  }
                  setEditingTask(false);
                }}
              >
                <SelectTrigger className="h-6 text-xs w-[160px]">
                  <SelectValue placeholder="No task" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No task</SelectItem>
                  {tasks.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : entry.task ? (
              <Badge
                variant="secondary"
                className="h-5 px-1.5 text-xs font-normal cursor-pointer bg-yellow-400 text-yellow-900 border-yellow-400 hover:bg-yellow-500"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingTask(true);
                }}
                title="Edit task"
              >
                {entry.task.title}
              </Badge>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingTask(true);
                }}
                className="h-5 px-1.5 text-xs font-normal text-muted-foreground border-dashed"
                title="Link task"
              >
                No task
              </Button>
            ))}
          {entry.taskId != null &&
            (editingSubtask ? (
              <Select
                open
                onOpenChange={(o) => !o && setEditingSubtask(false)}
                value={
                  entry.subtaskId != null ? String(entry.subtaskId) : "__none__"
                }
                onValueChange={(v) => {
                  if (v === "__none__") {
                    onUpdate({ id: entry.id, subtaskId: null });
                  } else {
                    const selected = subtasks.find((s) => s.id === Number(v));
                    const needsDesc = !entry.description?.trim();
                    const autoDesc =
                      selected && needsDesc
                        ? project && entry.task
                          ? `Task ${entry.task.title} › ${selected.title} of project ${project.title}`
                          : selected.title
                        : null;
                    onUpdate({
                      id: entry.id,
                      subtaskId: Number(v),
                      ...(autoDesc ? { description: autoDesc } : {}),
                    });
                  }
                  setEditingSubtask(false);
                }}
              >
                <SelectTrigger className="h-6 text-xs w-[180px]">
                  <SelectValue placeholder="No subtask" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No subtask</SelectItem>
                  {subtasks.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.checklistTitle
                        ? `${s.checklistTitle} › ${s.title}`
                        : s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : entry.subtask ? (
              <Badge
                variant="secondary"
                className="h-5 px-1.5 text-xs font-normal cursor-pointer bg-yellow-200 text-yellow-800 border-yellow-200 hover:bg-yellow-300"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingSubtask(true);
                }}
                title="Edit subtask"
              >
                {entry.subtask.checklistTitle
                  ? `${entry.subtask.checklistTitle} › ${entry.subtask.title}`
                  : entry.subtask.title}
              </Badge>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingSubtask(true);
                }}
                className="h-5 px-1.5 text-xs font-normal text-muted-foreground border-dashed"
                title="Link subtask"
              >
                No subtask
              </Button>
            ))}
          <TtcTagChips
            tagIds={entry.tags.map((t) => t.id)}
            tags={tags}
            onAdd={(id) =>
              onUpdate({
                id: entry.id,
                tagIds: [...entry.tags.map((t) => t.id), id],
              })
            }
            onRemove={(id) =>
              onUpdate({
                id: entry.id,
                tagIds: entry.tags.map((t) => t.id).filter((x) => x !== id),
              })
            }
          />
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ id: entry.id, billable: !entry.billable });
            }}
            aria-label="Toggle billable"
            className={cn(
              "h-5 px-1.5 text-xs font-mono",
              entry.billable
                ? "border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100"
                : "text-muted-foreground",
            )}
          >
            $
          </Button>
        </div>
        {(() => {
          const startField = (
            <EditableTimeField
              iso={entry.startTime}
              label="start time"
              isValid={(newIso) => !entry.endTime || newIso < entry.endTime}
              onCommit={(newIso) =>
                onUpdate({ id: entry.id, startTime: newIso })
              }
            />
          );
          const endField = entry.endTime ? (
            <EditableTimeField
              iso={entry.endTime}
              label="end time"
              isValid={(newIso) => newIso > entry.startTime}
              onCommit={(newIso) => onUpdate({ id: entry.id, endTime: newIso })}
            />
          ) : (
            <span className="text-primary">running</span>
          );
          const durationField = (
            <span>
              {entry.durationSeconds != null
                ? secsToHms(entry.durationSeconds)
                : "—"}
            </span>
          );

          return stackedTime ? (
            <div className="flex flex-col gap-0.5 text-xs font-mono text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="w-14 shrink-0 text-muted-foreground/70">
                  Start
                </span>
                {startField}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-14 shrink-0 text-muted-foreground/70">
                  End
                </span>
                {endField}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-14 shrink-0 text-muted-foreground/70">
                  Duration
                </span>
                {durationField}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
              {startField}
              <span>-</span>
              {endField}
              <span className="mx-0.5">·</span>
              {durationField}
            </div>
          );
        })()}
      </div>
      <div className="flex items-center gap-1 shrink-0 pt-1">
        {onResume && (
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onResume(entry);
            }}
            aria-label="Resume entry"
            className="text-muted-foreground hover:text-emerald-600"
          >
            ▶
          </Button>
        )}
        <Button
          size="icon-xs"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(entry.id);
          }}
          aria-label="Delete entry"
          className="text-muted-foreground hover:text-destructive"
        >
          ✕
        </Button>
      </div>
    </div>
  );
}
