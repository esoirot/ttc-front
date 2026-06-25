import { type RefObject, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateTaskLabel } from "@/hooks/tasks/useTasks";
import { PRESET_COLORS } from "@/constants/tasks";

export function TaskLabelPicker({
  taskId,
  triggerRef,
}: {
  taskId: number;
  triggerRef?: RefObject<HTMLButtonElement | null>;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[5]);
  const { createLabel, loading } = useCreateTaskLabel(taskId);

  async function handleAdd() {
    const n = name.trim();
    if (!n) return;
    await createLabel({ name: n, color });
    setName("");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          size="sm"
          className="h-7 text-xs"
        >
          + Add label
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3 flex flex-col gap-3" align="start">
        <Input
          placeholder="Label name…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleAdd();
          }}
          className="h-7 text-xs"
        />
        <div className="flex flex-wrap gap-1.5">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              style={{ backgroundColor: c }}
              className={`w-6 h-6 rounded-full transition-transform ${color === c ? "ring-2 ring-offset-1 ring-foreground scale-110" : ""}`}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
        <Button
          size="sm"
          className="h-7 text-xs"
          disabled={loading || !name.trim()}
          onClick={() => void handleAdd()}
        >
          Add
        </Button>
      </PopoverContent>
    </Popover>
  );
}
