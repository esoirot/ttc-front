import { useState } from "react";
import { useIntl, FormattedMessage } from "react-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateSubtask,
  useUpdateSubtask,
  useDeleteSubtask,
  useCreateChecklist,
  useDeleteChecklist,
  useRenameChecklist,
} from "@/hooks/tasks/useTasks";
import type { Subtask } from "@/types/tasks.types";
import { Badge } from "@/components/ui/badge";
import { parseWordCount } from "@/lib/words";

const TIME_SLOTS: string[] = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

function formatTimeSlot(slot: string): string {
  const [hStr, mStr] = slot.split(":");
  const h = parseInt(hStr, 10);
  const suffix = h < 12 ? "AM" : "PM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${mStr} ${suffix}`;
}

function isoToDateStr(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA");
}

function isoToTimeSlot(iso: string): string {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, "0");
  const m = d.getMinutes() < 30 ? "00" : "30";
  return `${h}:${m}`;
}

function toIso(dateStr: string, timeSlot: string): string {
  return new Date(`${dateStr}T${timeSlot}:00`).toISOString();
}

type DialogState =
  | { mode: "create"; checklistTitle: string; title: string }
  | { mode: "edit"; subtask: Subtask };

function SubtaskItemDialog({
  state,
  taskId,
  showWords,
  onClose,
}: {
  state: DialogState;
  taskId: number;
  showWords: boolean;
  onClose: () => void;
}) {
  const intl = useIntl();
  const isEdit = state.mode === "edit";
  const initial = isEdit ? state.subtask : null;

  const [title, setTitle] = useState(isEdit ? initial!.title : state.title);
  const [hasDueDate, setHasDueDate] = useState(
    isEdit ? !!initial!.dueDate : false,
  );
  const [dateStr, setDateStr] = useState(
    isEdit && initial!.dueDate ? isoToDateStr(initial!.dueDate) : "",
  );
  const [timeSlot, setTimeSlot] = useState(
    isEdit && initial!.dueDate ? isoToTimeSlot(initial!.dueDate) : "09:00",
  );

  const [words, setWords] = useState(
    initial?.wordCount != null ? String(initial.wordCount) : "",
  );
  const [wordsInvalid, setWordsInvalid] = useState(false);
  const [countInTotal, setCountInTotal] = useState(
    initial?.countInTotal ?? true,
  );

  const { createSubtask, loading: creating } = useCreateSubtask(taskId);
  const { updateSubtask, loading: updating } = useUpdateSubtask(taskId);
  const { deleteSubtask } = useDeleteSubtask(taskId);
  const saving = creating || updating;

  async function handleSave() {
    const t = title.trim();
    if (!t) return;
    const wordCount = showWords ? parseWordCount(words) : undefined;
    if (wordCount === "invalid") {
      setWordsInvalid(true);
      return;
    }
    const dueDate =
      hasDueDate && dateStr ? toIso(dateStr, timeSlot) : undefined;
    if (isEdit) {
      await updateSubtask({
        id: initial!.id,
        title: t,
        dueDate: hasDueDate ? dueDate : null,
        ...(showWords ? { wordCount, countInTotal } : {}),
      });
    } else {
      await createSubtask({
        checklistTitle: state.checklistTitle,
        title: t,
        dueDate,
        ...(showWords ? { wordCount, countInTotal } : {}),
      });
    }
    onClose();
  }

  async function handleRemove() {
    if (isEdit) await deleteSubtask(initial!.id);
    onClose();
  }

  return (
    <Dialog
      open
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="max-w-sm w-full" aria-describedby={undefined}>
        <DialogTitle className="text-sm font-medium">
          {isEdit ? (
            <FormattedMessage
              id="projects.taskChecklist.editItem"
              defaultMessage="Edit checklist item"
            />
          ) : (
            <FormattedMessage
              id="projects.taskChecklist.newItem"
              defaultMessage="New checklist item"
            />
          )}
        </DialogTitle>

        <div className="flex flex-col gap-4 mt-1">
          <Input
            autoFocus
            placeholder={intl.formatMessage({
              id: "projects.taskChecklist.itemTitlePlaceholder",
              defaultMessage: "Item title…",
            })}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleSave();
              if (e.key === "Escape") onClose();
            }}
            className="h-8 text-sm"
          />

          {showWords && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="subtask-words"
                  className="text-xs text-muted-foreground"
                >
                  <FormattedMessage
                    id="projects.words.label"
                    defaultMessage="Words"
                  />
                </Label>
                <Input
                  id="subtask-words"
                  inputMode="numeric"
                  value={words}
                  onChange={(e) => {
                    setWords(e.target.value);
                    setWordsInvalid(false);
                  }}
                  aria-invalid={wordsInvalid || undefined}
                  className="h-8 w-28 text-sm"
                />
                <Checkbox
                  id="subtask-count-in-total"
                  checked={countInTotal}
                  onCheckedChange={(v) => setCountInTotal(!!v)}
                />
                <Label
                  htmlFor="subtask-count-in-total"
                  className="text-xs text-muted-foreground cursor-pointer"
                >
                  <FormattedMessage
                    id="projects.taskChecklist.countInTotal"
                    defaultMessage="Count for total sum words"
                  />
                </Label>
              </div>
              {wordsInvalid && (
                <p className="text-xs text-destructive">
                  <FormattedMessage
                    id="projects.words.invalid"
                    defaultMessage="Words must be a whole number of 0 or more."
                  />
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="subtask-due-date"
                checked={hasDueDate}
                onCheckedChange={(v) => setHasDueDate(!!v)}
              />
              <Label
                htmlFor="subtask-due-date"
                className="text-sm cursor-pointer"
              >
                <FormattedMessage
                  id="projects.taskChecklist.dueDate"
                  defaultMessage="Due Date"
                />
              </Label>
            </div>
            {hasDueDate && (
              <div className="flex gap-2 pl-6">
                <Input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="h-8 text-sm flex-1"
                />
                <Select value={timeSlot} onValueChange={setTimeSlot}>
                  <SelectTrigger className="h-8 text-sm w-[120px] shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {TIME_SLOTS.map((s) => (
                      <SelectItem key={s} value={s} className="text-xs">
                        {formatTimeSlot(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex justify-between gap-2 pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => void handleRemove()}
            >
              {isEdit ? (
                <FormattedMessage
                  id="projects.taskChecklist.remove"
                  defaultMessage="Remove"
                />
              ) : (
                <FormattedMessage
                  id="common.actions.cancel"
                  defaultMessage="Cancel"
                />
              )}
            </Button>
            <Button
              size="sm"
              onClick={() => void handleSave()}
              disabled={saving || !title.trim() || (hasDueDate && !dateStr)}
            >
              <FormattedMessage
                id="common.actions.save"
                defaultMessage="Save"
              />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ChecklistGroup({
  checklistTitle,
  items,
  taskId,
  showWords,
}: {
  checklistTitle: string;
  items: Subtask[];
  taskId: number;
  showWords: boolean;
}) {
  const intl = useIntl();
  const [newTitle, setNewTitle] = useState("");
  const [dialogState, setDialogState] = useState<DialogState | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState(checklistTitle);
  const { updateSubtask } = useUpdateSubtask(taskId);
  const { renameChecklist } = useRenameChecklist(taskId);
  const { deleteChecklist } = useDeleteChecklist(taskId);

  const done = items.filter((s) => s.done).length;

  async function saveTitle() {
    const t = titleVal.trim();
    if (!t || t === checklistTitle) {
      setEditingTitle(false);
      return;
    }
    await renameChecklist(checklistTitle, t);
    setEditingTitle(false);
  }

  function openCreate() {
    const t = newTitle.trim();
    if (!t) return;
    setDialogState({ mode: "create", checklistTitle, title: t });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm gap-2">
        {editingTitle ? (
          <input
            autoFocus
            className="flex-1 text-sm font-medium bg-transparent border-b border-border outline-none"
            value={titleVal}
            onChange={(e) => setTitleVal(e.target.value)}
            onBlur={() => void saveTitle()}
            onKeyDown={(e) => {
              if (e.key === "Enter") void saveTitle();
              if (e.key === "Escape") {
                setTitleVal(checklistTitle);
                setEditingTitle(false);
              }
            }}
          />
        ) : (
          <span
            className="font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
            onClick={() => {
              setTitleVal(checklistTitle);
              setEditingTitle(true);
            }}
            title={intl.formatMessage({
              id: "projects.taskChecklist.clickToRename",
              defaultMessage: "Click to rename",
            })}
          >
            {checklistTitle}
          </span>
        )}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-muted-foreground text-xs">
            {done}/{items.length}
          </span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
              >
                ✕
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  <FormattedMessage
                    id="projects.taskChecklist.deleteChecklist"
                    defaultMessage="Delete checklist"
                  />
                </AlertDialogTitle>
                <AlertDialogDescription>
                  <FormattedMessage
                    id="projects.taskChecklist.deleteChecklistConfirm"
                    defaultMessage="Delete “{checklistTitle}” and all its items? This cannot be undone."
                    values={{ checklistTitle }}
                  />
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  <FormattedMessage
                    id="common.actions.cancel"
                    defaultMessage="Cancel"
                  />
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => void deleteChecklist(checklistTitle)}
                >
                  <FormattedMessage
                    id="common.actions.delete"
                    defaultMessage="Delete"
                  />
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {items.length > 0 && (
        <div className="w-full bg-muted rounded h-1.5">
          <div
            className="bg-primary h-1.5 rounded transition-all"
            style={{
              width: `${items.length ? (done / items.length) * 100 : 0}%`,
            }}
          />
        </div>
      )}

      <div className="flex flex-col gap-1">
        {items.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-2 group cursor-pointer rounded px-1 hover:bg-muted/50"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("[data-no-open]")) return;
              setDialogState({ mode: "edit", subtask: s });
            }}
          >
            <span data-no-open>
              <Checkbox
                checked={s.done}
                onCheckedChange={(checked) =>
                  void updateSubtask({ id: s.id, done: !!checked })
                }
              />
            </span>
            <div className="flex flex-col flex-1 min-w-0 py-0.5">
              <span
                className={
                  s.done
                    ? "line-through text-muted-foreground text-sm"
                    : "text-sm"
                }
              >
                {s.title}
              </span>
              {showWords && s.wordCount != null && (
                <Badge
                  variant="secondary"
                  className="w-fit font-mono text-[11px]"
                >
                  {intl.formatMessage(
                    {
                      id: "projects.words.count",
                      defaultMessage:
                        "{count, plural, one {# word} other {# words}}",
                    },
                    { count: s.wordCount },
                  )}
                  {!s.countInTotal && (
                    <>
                      {" · "}
                      <span>
                        <FormattedMessage
                          id="projects.taskChecklist.notCounted"
                          defaultMessage="not counted"
                        />
                      </span>
                    </>
                  )}
                </Badge>
              )}
              {s.dueDate && (
                <span className="text-[11px] text-muted-foreground">
                  {intl.formatDate(s.dueDate, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder={intl.formatMessage({
            id: "projects.taskChecklist.addItemPlaceholder",
            defaultMessage: "Add an item…",
          })}
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") openCreate();
          }}
          className="h-7 text-xs"
        />
        <Button
          size="sm"
          className="h-7 text-xs"
          onClick={openCreate}
          disabled={!newTitle.trim()}
        >
          <FormattedMessage
            id="projects.taskChecklist.add"
            defaultMessage="Add"
          />
        </Button>
      </div>

      {dialogState && (
        <SubtaskItemDialog
          state={dialogState}
          taskId={taskId}
          showWords={showWords}
          onClose={() => {
            setDialogState(null);
            setNewTitle("");
          }}
        />
      )}
    </div>
  );
}

export function TaskChecklist({
  taskId,
  subtasks,
  checklistTitles,
  addingChecklist,
  onAddingChecklistChange,
  showWords = false,
}: {
  taskId: number;
  subtasks: Subtask[];
  checklistTitles: string[];
  addingChecklist: boolean;
  onAddingChecklistChange: (v: boolean) => void;
  /** Show word counts (translation projects only). */
  showWords?: boolean;
}) {
  const intl = useIntl();
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const { createChecklist } = useCreateChecklist(taskId);

  const groups = subtasks.reduce<Record<string, Subtask[]>>((acc, s) => {
    const key = s.checklistTitle ?? "__ungrouped__";
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const groupedTitles = Object.keys(groups).filter(
    (k) => k !== "__ungrouped__",
  );
  const ungrouped = groups["__ungrouped__"] ?? [];

  function confirmNewChecklist() {
    const t = newChecklistTitle.trim();
    if (!t) return;
    setNewChecklistTitle("");
    onAddingChecklistChange(false);
    void createChecklist(t);
  }

  return (
    <div className="flex flex-col gap-4">
      {ungrouped.length > 0 && (
        <ChecklistGroup
          checklistTitle={intl.formatMessage({
            id: "projects.taskChecklist.defaultTitle",
            defaultMessage: "Checklist",
          })}
          items={ungrouped}
          taskId={taskId}
          showWords={showWords}
        />
      )}

      {groupedTitles.map((title) => (
        <ChecklistGroup
          key={title}
          checklistTitle={title}
          items={groups[title]}
          taskId={taskId}
          showWords={showWords}
        />
      ))}

      {addingChecklist && (
        <div className="flex gap-2">
          <Input
            autoFocus
            placeholder={intl.formatMessage({
              id: "projects.taskChecklist.newTitlePlaceholder",
              defaultMessage: "Checklist title…",
            })}
            value={newChecklistTitle}
            onChange={(e) => setNewChecklistTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmNewChecklist();
              if (e.key === "Escape") {
                onAddingChecklistChange(false);
                setNewChecklistTitle("");
              }
            }}
            className="h-7 text-xs"
          />
          <Button
            size="sm"
            className="h-7 text-xs"
            onClick={confirmNewChecklist}
            disabled={!newChecklistTitle.trim()}
          >
            <FormattedMessage
              id="projects.taskChecklist.create"
              defaultMessage="Create"
            />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs"
            onClick={() => {
              onAddingChecklistChange(false);
              setNewChecklistTitle("");
            }}
          >
            <FormattedMessage
              id="common.actions.cancel"
              defaultMessage="Cancel"
            />
          </Button>
        </div>
      )}

      {checklistTitles
        .filter((t) => !groups[t])
        .map((t) => (
          <ChecklistGroup
            key={t}
            checklistTitle={t}
            items={[]}
            taskId={taskId}
            showWords={showWords}
          />
        ))}
    </div>
  );
}
