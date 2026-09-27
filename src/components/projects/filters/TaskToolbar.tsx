import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TaskToolbarProps as Props } from "@/types/projects.types";
import { TaskSortControls } from "./TaskSortControls";

export function TaskToolbar({
  idPrefix,
  dueFrom,
  dueTo,
  onDueFromChange,
  onDueToChange,
  sortField,
  sortDirection,
  onSortFieldChange,
  onSortDirectionChange,
  onNewTask,
  children,
}: Props) {
  const dueDateFilterActive = dueFrom !== "" || dueTo !== "";
  return (
    <div
      role="toolbar"
      aria-label="Task filters"
      className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-end"
    >
      {children && (
        <div className="col-span-2 flex flex-col gap-1 sm:col-span-1">
          {children}
        </div>
      )}
      <div className="flex flex-col gap-1">
        <Label
          htmlFor={`${idPrefix}-due-from`}
          className="text-xs text-muted-foreground"
        >
          Due from
        </Label>
        <Input
          id={`${idPrefix}-due-from`}
          type="date"
          value={dueFrom}
          onChange={(e) => onDueFromChange(e.target.value)}
          max={dueTo || undefined}
          className="w-full sm:w-40"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label
          htmlFor={`${idPrefix}-due-to`}
          className="text-xs text-muted-foreground"
        >
          Due to
        </Label>
        <Input
          id={`${idPrefix}-due-to`}
          type="date"
          value={dueTo}
          onChange={(e) => onDueToChange(e.target.value)}
          min={dueFrom || undefined}
          className="w-full sm:w-40"
        />
      </div>
      <TaskSortControls
        field={sortField}
        direction={sortDirection}
        onFieldChange={onSortFieldChange}
        onDirectionChange={onSortDirectionChange}
        idPrefix={idPrefix}
      />
      {dueDateFilterActive && (
        <Button
          variant="ghost"
          className="col-span-2 sm:col-span-1"
          onClick={() => {
            onDueFromChange("");
            onDueToChange("");
          }}
        >
          Clear filter
        </Button>
      )}
      {onNewTask && (
        <Button className="col-span-2 sm:ml-auto" onClick={onNewTask}>
          + New task
        </Button>
      )}
    </div>
  );
}
