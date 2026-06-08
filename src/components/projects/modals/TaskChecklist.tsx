import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
  useRenameChecklist,
} from "@/hooks/tasks/useTasks";
import type { Subtask } from "@/types/tasks.types";

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
  return iso.slice(0, 10);
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
  onClose,
}: {
  state: DialogState;
  taskId: number;
  onClose: () => void;
}) {
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

  const { createSubtask, loading: creating } = useCreateSubtask(taskId);
  const { updateSubtask, loading: updating } = useUpdateSubtask(taskId);
  const { deleteSubtask } = useDeleteSubtask(taskId);
  const saving = creating || updating;

  async function handleSave() {
    const t = title.trim();
    if (!t) return;
    const dueDate =
      hasDueDate && dateStr ? toIso(dateStr, timeSlot) : undefined;
    if (isEdit) {
      await updateSubtask({
        id: initial!.id,
        title: t,
        dueDate: hasDueDate ? dueDate : null,
      });
    } else {
      await createSubtask({
        checklistTitle: state.checklistTitle,
        title: t,
        dueDate,
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
          {isEdit ? "Edit checklist item" : "New checklist item"}
        </DialogTitle>

        <div className="flex flex-col gap-4 mt-1">
          <Input
            autoFocus
            placeholder="Item title…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleSave();
              if (e.key === "Escape") onClose();
            }}
            className="h-8 text-sm"
          />

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
                Due Date
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
              {isEdit ? "Remove" : "Cancel"}
            </Button>
            <Button
              size="sm"
              onClick={() => void handleSave()}
              disabled={saving || !title.trim() || (hasDueDate && !dateStr)}
            >
              Save
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
}: {
  checklistTitle: string;
  items: Subtask[];
  taskId: number;
}) {
  const [newTitle, setNewTitle] = useState("");
  const [dialogState, setDialogState] = useState<DialogState | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState(checklistTitle);
  const { updateSubtask } = useUpdateSubtask(taskId);
  const { renameChecklist } = useRenameChecklist(taskId);

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
            title="Click to rename"
          >
            {checklistTitle}
          </span>
        )}
        <span className="text-muted-foreground text-xs shrink-0">
          {done}/{items.length}
        </span>
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
              {s.dueDate && (
                <span className="text-[11px] text-muted-foreground">
                  {new Date(s.dueDate).toLocaleString(undefined, {
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
          placeholder="Add an item…"
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
          Add
        </Button>
      </div>

      {dialogState && (
        <SubtaskItemDialog
          state={dialogState}
          taskId={taskId}
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
}: {
  taskId: number;
  subtasks: Subtask[];
}) {
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [addingChecklist, setAddingChecklist] = useState(false);

  const groups = subtasks.reduce<Record<string, Subtask[]>>((acc, s) => {
    const key = s.checklistTitle ?? "__ungrouped__";
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const checklistTitles = Object.keys(groups).filter(
    (k) => k !== "__ungrouped__",
  );
  const ungrouped = groups["__ungrouped__"] ?? [];

  function confirmNewChecklist() {
    const t = newChecklistTitle.trim();
    if (!t) return;
    setNewChecklistTitle("");
    setAddingChecklist(false);
  }

  return (
    <div className="flex flex-col gap-4">
      {ungrouped.length > 0 && (
        <ChecklistGroup
          checklistTitle="Checklist"
          items={ungrouped}
          taskId={taskId}
        />
      )}

      {checklistTitles.map((title) => (
        <ChecklistGroup
          key={title}
          checklistTitle={title}
          items={groups[title]}
          taskId={taskId}
        />
      ))}

      {addingChecklist ? (
        <div className="flex gap-2">
          <Input
            autoFocus
            placeholder="Checklist title…"
            value={newChecklistTitle}
            onChange={(e) => setNewChecklistTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmNewChecklist();
              if (e.key === "Escape") {
                setAddingChecklist(false);
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
            Create
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs"
            onClick={() => {
              setAddingChecklist(false);
              setNewChecklistTitle("");
            }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs self-start"
          onClick={() => setAddingChecklist(true)}
        >
          + New checklist
        </Button>
      )}

      {newChecklistTitle && !addingChecklist && (
        <ChecklistGroup
          checklistTitle={newChecklistTitle}
          items={[]}
          taskId={taskId}
        />
      )}
    </div>
  );
}
