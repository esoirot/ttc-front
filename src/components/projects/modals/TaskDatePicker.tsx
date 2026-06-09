import { type RefObject, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TaskDatePicker({
  dueDate,
  onUpdate,
  triggerRef,
}: {
  dueDate: string | null;
  onUpdate: (dueDate: string | null) => void;
  triggerRef?: RefObject<HTMLButtonElement>;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(dueDate?.slice(0, 10) ?? "");

  function handleSave() {
    onUpdate(value || null);
    setOpen(false);
  }

  function handleClear() {
    setValue("");
    onUpdate(null);
    setOpen(false);
  }

  const label = dueDate
    ? new Date(dueDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No date";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          size="sm"
          className="h-7 text-xs w-fit"
        >
          📅 {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-3 flex flex-col gap-2" align="start">
        <Input
          type="date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-7 text-xs"
        />
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 h-7 text-xs" onClick={handleSave}>
            Set
          </Button>
          {dueDate && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={handleClear}
            >
              Clear
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
