import { TaskPicker } from "@/components/projects/pickers/TaskPicker";
import { ProjectPicker } from "@/components/projects/pickers/ProjectPicker";
import { useState, useRef } from "react";
import { useIntl, FormattedMessage } from "react-intl";
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
import { useTask } from "@/hooks/tasks/useTasks";

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
  const intl = useIntl();
  const noProject = intl.formatMessage({
    id: "time.entryRow.noProject",
    defaultMessage: "No project",
  });
  const noTask = intl.formatMessage({
    id: "time.entryRow.noTask",
    defaultMessage: "No task",
  });
  const noSubtask = intl.formatMessage({
    id: "time.entryRow.noSubtask",
    defaultMessage: "No subtask",
  });
  const noOccupation = intl.formatMessage({
    id: "time.entryRow.noOccupation",
    defaultMessage: "No occupation",
  });
  const [editingDesc, setEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState(entry.description ?? "");
  const [editingProject, setEditingProject] = useState(false);
  const [editingTask, setEditingTask] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState(false);
  const [editingOccupation, setEditingOccupation] = useState(false);
  const descInputRef = useRef<HTMLInputElement>(null);

  const project = projects.find((p) => p.id === entry.projectId) ?? null;
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
            placeholder={intl.formatMessage({
              id: "time.entryRow.descriptionPlaceholder",
              defaultMessage: "Description",
            })}
          />
        ) : (
          <p
            className="text-sm truncate cursor-text hover:text-foreground/80"
            onClick={(e) => {
              e.stopPropagation();
              startEditDesc();
            }}
            title={intl.formatMessage({
              id: "time.entryRow.editDescriptionTitle",
              defaultMessage: "Click to edit description",
            })}
          >
            {entry.description || (
              <span className="italic text-muted-foreground">
                <FormattedMessage
                  id="time.entryRow.noDescription"
                  defaultMessage="No description"
                />
              </span>
            )}
          </p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          {editingProject ? (
            <ProjectPicker
              defaultOpen
              onOpenChange={(o) => !o && setEditingProject(false)}
              className="h-6 text-xs w-[160px]"
              value={entry.projectId != null ? String(entry.projectId) : ""}
              onChange={(v) =>
                onUpdate({
                  id: entry.id,
                  projectId: v ? Number(v) : null,
                  taskId: null,
                  subtaskId: null,
                })
              }
              placeholder={noProject}
              noneLabel={noProject}
            />
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
              title={intl.formatMessage({
                id: "time.entryRow.editProjectTitle",
                defaultMessage: "Edit project",
              })}
            >
              {project?.title ?? noProject}
            </Button>
          )}
          {entry.projectId != null &&
            (editingTask ? (
              <TaskPicker
                projectId={entry.projectId}
                defaultOpen
                onOpenChange={(o) => !o && setEditingTask(false)}
                className="h-6 text-xs w-[160px]"
                value={entry.taskId != null ? String(entry.taskId) : ""}
                onChange={(v, title) => {
                  if (!v || !title) {
                    onUpdate({ id: entry.id, taskId: null, subtaskId: null });
                    return;
                  }
                  const autoDesc = entry.description?.trim()
                    ? null
                    : project
                      ? intl.formatMessage(
                          {
                            id: "time.entryRow.autoDescTaskOfProject",
                            defaultMessage: "Task {task} of project {project}",
                          },
                          { task: title, project: project.title },
                        )
                      : title;
                  onUpdate({
                    id: entry.id,
                    taskId: Number(v),
                    ...(autoDesc ? { description: autoDesc } : {}),
                  });
                }}
                placeholder={noTask}
                noneLabel={noTask}
              />
            ) : entry.task ? (
              <Badge
                variant="secondary"
                className="h-5 px-1.5 text-xs font-normal cursor-pointer bg-yellow-400 text-yellow-900 border-yellow-400 hover:bg-yellow-500"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingTask(true);
                }}
                title={intl.formatMessage({
                  id: "time.entryRow.editTaskTitle",
                  defaultMessage: "Edit task",
                })}
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
                title={intl.formatMessage({
                  id: "time.entryRow.linkTaskTitle",
                  defaultMessage: "Link task",
                })}
              >
                {noTask}
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
                          ? intl.formatMessage(
                              {
                                id: "time.entryRow.autoDescSubtaskOfProject",
                                defaultMessage:
                                  "Task {task} › {subtask} of project {project}",
                              },
                              {
                                task: entry.task.title,
                                subtask: selected.title,
                                project: project.title,
                              },
                            )
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
                  <SelectValue placeholder={noSubtask} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">{noSubtask}</SelectItem>
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
                title={intl.formatMessage({
                  id: "time.entryRow.editSubtaskTitle",
                  defaultMessage: "Edit subtask",
                })}
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
                title={intl.formatMessage({
                  id: "time.entryRow.linkSubtaskTitle",
                  defaultMessage: "Link subtask",
                })}
              >
                {noSubtask}
              </Button>
            ))}
          {entry.projectId != null &&
            (editingOccupation ? (
              <Select
                open
                onOpenChange={(o) => !o && setEditingOccupation(false)}
                value={
                  entry.occupationId != null
                    ? String(entry.occupationId)
                    : "__none__"
                }
                onValueChange={(v) => {
                  onUpdate({
                    id: entry.id,
                    occupationId: v === "__none__" ? null : Number(v),
                  });
                  setEditingOccupation(false);
                }}
              >
                <SelectTrigger className="h-6 text-xs w-[160px]">
                  <SelectValue placeholder={noOccupation} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">{noOccupation}</SelectItem>
                  {(project?.occupations ?? []).map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : entry.occupation ? (
              <Badge
                variant="outline"
                className="h-5 px-1.5 text-xs font-normal cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingOccupation(true);
                }}
                title={intl.formatMessage({
                  id: "time.entryRow.editOccupationTitle",
                  defaultMessage: "Edit occupation",
                })}
              >
                {entry.occupation.name}
              </Badge>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingOccupation(true);
                }}
                className="h-5 px-1.5 text-xs font-normal text-muted-foreground border-dashed"
                title={intl.formatMessage({
                  id: "time.entryRow.linkOccupationTitle",
                  defaultMessage: "Link occupation",
                })}
              >
                {noOccupation}
              </Button>
            ))}
          <TtcTagChips
            tagIds={entry.tags.map((t) => t.id)}
            tags={tags}
            onChange={(tagIds) => onUpdate({ id: entry.id, tagIds })}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ id: entry.id, billable: !entry.billable });
            }}
            aria-label={intl.formatMessage({
              id: "time.entryRow.toggleBillable",
              defaultMessage: "Toggle billable",
            })}
            className={cn(
              "h-5 px-1.5 text-xs font-mono",
              entry.billable
                ? "border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100"
                : "text-muted-foreground",
            )}
          >
            $
          </Button>
          {entry.invoicingStatus === "INVOICED" && (
            <Badge
              variant="secondary"
              className="h-5 px-1.5 text-xs font-normal bg-blue-100 text-blue-700 border-blue-200"
            >
              <FormattedMessage
                id="time.entryRow.invoiced"
                defaultMessage="Invoiced"
              />
            </Badge>
          )}
        </div>
        {(() => {
          const startField = (
            <EditableTimeField
              iso={entry.startTime}
              label={intl.formatMessage({
                id: "time.entryRow.startTimeLabel",
                defaultMessage: "start time",
              })}
              isValid={(newIso) => !entry.endTime || newIso < entry.endTime}
              onCommit={(newIso) =>
                onUpdate({ id: entry.id, startTime: newIso })
              }
            />
          );
          const endField = entry.endTime ? (
            <EditableTimeField
              iso={entry.endTime}
              label={intl.formatMessage({
                id: "time.entryRow.endTimeLabel",
                defaultMessage: "end time",
              })}
              isValid={(newIso) => newIso > entry.startTime}
              onCommit={(newIso) => onUpdate({ id: entry.id, endTime: newIso })}
            />
          ) : (
            <span className="text-primary">
              <FormattedMessage
                id="time.entryRow.running"
                defaultMessage="running"
              />
            </span>
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
                  <FormattedMessage
                    id="time.entryRow.startLabel"
                    defaultMessage="Start"
                  />
                </span>
                {startField}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-14 shrink-0 text-muted-foreground/70">
                  <FormattedMessage
                    id="time.entryRow.endLabel"
                    defaultMessage="End"
                  />
                </span>
                {endField}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-14 shrink-0 text-muted-foreground/70">
                  <FormattedMessage
                    id="time.entryRow.durationLabel"
                    defaultMessage="Duration"
                  />
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
            aria-label={intl.formatMessage({
              id: "time.entryRow.resumeEntry",
              defaultMessage: "Resume entry",
            })}
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
          aria-label={intl.formatMessage({
            id: "time.entryRow.deleteEntry",
            defaultMessage: "Delete entry",
          })}
          className="text-muted-foreground hover:text-destructive"
        >
          ✕
        </Button>
      </div>
    </div>
  );
}
