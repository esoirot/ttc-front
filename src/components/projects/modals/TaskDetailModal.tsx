import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTask, useUpdateTask } from "@/hooks/tasks/useTasks";
import type { TaskStatus } from "@/types/tasks.types";
import {
  STATUS_LABELS,
  STATUS_VARIANTS,
  STATUS_BADGE_CLASSES,
  TASK_STATUSES,
} from "@/constants/tasks";
import { TaskChecklist } from "./TaskChecklist";
import { TaskLabelPicker } from "./TaskLabelPicker";
import { TaskDatePicker } from "./TaskDatePicker";
import { TaskCommentList } from "./TaskCommentList";
import { TaskActivityFeed } from "./TaskActivityFeed";
import { TaskAttachmentModal } from "./TaskAttachmentModal";
import { TaskLabelBadges } from "./TaskLabelBadges";
import { TaskTimeSection } from "./TaskTimeSection";
import { AttachmentList } from "./AttachmentList";

const STATUSES: TaskStatus[] = TASK_STATUSES;

export function TaskDetailModal({
  taskId,
  projectId,
  open,
  onClose,
  currentUserId,
}: {
  taskId: number;
  projectId: number;
  open: boolean;
  onClose: () => void;
  currentUserId: number | undefined;
}) {
  const { task, loading } = useTask(taskId);
  const { updateTask } = useUpdateTask(projectId);

  const [addingChecklist, setAddingChecklist] = useState(false);
  const [checklistSectionOpen, setChecklistSectionOpen] = useState(false);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [labelPickerOpen, setLabelPickerOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState("");

  function startEditTitle() {
    if (!task) return;
    setTitleVal(task.title);
    setEditingTitle(true);
  }

  async function saveTitle() {
    if (!task || !titleVal.trim()) return;
    if (titleVal.trim() !== task.title) {
      await updateTask({ id: task.id, title: titleVal.trim() });
    }
    setEditingTitle(false);
  }

  async function handleDescriptionBlur(desc: string) {
    if (!task) return;
    if (desc !== (task.description ?? "")) {
      await updateTask({ id: task.id, description: desc });
    }
  }

  const showChecklistSection =
    checklistSectionOpen ||
    (task?.subtasks?.length ?? 0) > 0 ||
    (task?.checklistTitles?.length ?? 0) > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent
        className="max-w-5xl sm:max-w-5xl w-full p-0 overflow-hidden"
        showCloseButton={false}
        aria-describedby={undefined}
      >
        {loading || !task ? (
          <div className="p-6 flex flex-col gap-4">
            <DialogTitle className="sr-only">Loading task</DialogTitle>
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-6 pt-5 pb-3 flex items-center gap-3">
              <DialogTitle
                className="text-base leading-snug flex-1 min-w-0"
                asChild
              >
                <div className="min-w-0">
                  {editingTitle ? (
                    <input
                      autoFocus
                      className="w-full text-lg font-semibold bg-transparent border-b border-border outline-none"
                      value={titleVal}
                      onChange={(e) => setTitleVal(e.target.value)}
                      onBlur={() => void saveTitle()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void saveTitle();
                        if (e.key === "Escape") setEditingTitle(false);
                      }}
                    />
                  ) : (
                    <h2
                      className="text-lg font-semibold cursor-pointer hover:text-primary transition-colors truncate"
                      onClick={startEditTitle}
                      title="Click to edit title"
                    >
                      {task.title}
                    </h2>
                  )}
                </div>
              </DialogTitle>
              <Select
                value={task.status}
                onValueChange={(v) =>
                  void updateTask({ id: task.id, status: v as TaskStatus })
                }
              >
                <SelectTrigger className="h-7 text-xs w-32.5 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="text-xs">
                      <Badge
                        variant={STATUS_VARIANTS[s]}
                        className={STATUS_BADGE_CLASSES[s]}
                      >
                        {STATUS_LABELS[s]}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={onClose}
                aria-label="Close"
                className="text-muted-foreground hover:text-foreground shrink-0"
              >
                ✕
              </Button>
            </div>

            <Separator />

            {/* Body */}
            <div className="flex flex-col sm:flex-row max-h-[70vh] overflow-hidden">
              {/* Left panel */}
              <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
                {/* Description */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Description
                  </span>
                  <Textarea
                    defaultValue={task.description ?? ""}
                    placeholder="Add a description…"
                    className="min-h-20 text-sm resize-none"
                    onBlur={(e) => void handleDescriptionBlur(e.target.value)}
                  />
                </div>

                {/* Label badges */}
                <TaskLabelBadges taskId={task.id} labels={task.labels} />

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                      >
                        + Add
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-44">
                      <DropdownMenuItem
                        onSelect={() => {
                          setChecklistSectionOpen(true);
                          setAddingChecklist(true);
                        }}
                      >
                        Checklist
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => setLabelPickerOpen(true)}
                      >
                        Label
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => setDatePickerOpen(true)}
                      >
                        Date
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => setAttachmentModalOpen(true)}
                      >
                        Attachment
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled>Custom Field</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setChecklistSectionOpen(true);
                      setAddingChecklist(true);
                    }}
                  >
                    + New checklist
                  </Button>
                  <TaskLabelPicker
                    taskId={task.id}
                    open={labelPickerOpen}
                    onOpenChange={setLabelPickerOpen}
                  />
                  <TaskDatePicker
                    key={task.id}
                    startDate={task.startDate}
                    dueDate={task.dueDate}
                    recurring={task.recurring}
                    reminderOffset={task.reminderOffset}
                    open={datePickerOpen}
                    onOpenChange={setDatePickerOpen}
                    onUpdate={(data) =>
                      void updateTask({ id: task.id, ...data })
                    }
                  />
                </div>

                {/* Checklist */}
                {showChecklistSection && (
                  <TaskChecklist
                    taskId={task.id}
                    subtasks={task.subtasks}
                    checklistTitles={task.checklistTitles}
                    addingChecklist={addingChecklist}
                    onAddingChecklistChange={setAddingChecklist}
                  />
                )}

                {/* Attachments */}
                {task.attachments.length > 0 && (
                  <AttachmentList
                    taskId={task.id}
                    attachments={task.attachments}
                    onAdd={() => setAttachmentModalOpen(true)}
                  />
                )}
              </div>

              {/* Right panel */}
              <div className="sm:w-80 border-l border-border overflow-y-auto px-4 py-4 flex flex-col gap-4 shrink-0">
                {/* Time tracking */}
                <TaskTimeSection
                  taskId={task.id}
                  projectId={projectId}
                  taskTitle={task.title}
                />

                <Separator />

                {/* Activity */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Activity
                  </span>
                  <TaskActivityFeed activities={task.activities} />
                </div>

                <Separator />

                {/* Comments */}
                <TaskCommentList
                  taskId={task.id}
                  comments={task.comments}
                  currentUserId={currentUserId}
                />
              </div>
            </div>
          </>
        )}
      </DialogContent>

      {task && (
        <TaskAttachmentModal
          taskId={task.id}
          open={attachmentModalOpen}
          onClose={() => setAttachmentModalOpen(false)}
        />
      )}
    </Dialog>
  );
}
