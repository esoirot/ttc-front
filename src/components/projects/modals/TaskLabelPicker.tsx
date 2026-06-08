import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCreateTaskLabel, useDeleteTaskLabel } from "@/hooks/tasks/useTasks";
import type { TaskLabel } from "@/types/tasks.types";

const PRESET_COLORS = [
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#6B7280",
];

export function TaskLabelBadges({
  taskId,
  labels,
}: {
  taskId: number;
  labels: TaskLabel[];
}) {
  const { deleteLabel } = useDeleteTaskLabel(taskId);
  if (!labels.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {labels.map((l) => (
        <Badge
          key={l.id}
          style={{ backgroundColor: l.color }}
          className="text-white text-xs gap-1 cursor-default"
        >
          {l.name}
          <button
            onClick={() => void deleteLabel(l.id)}
            className="hover:opacity-70 leading-none"
          >
            ✕
          </button>
        </Badge>
      ))}
    </div>
  );
}

export function TaskLabelPicker({ taskId }: { taskId: number }) {
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
        <Button variant="outline" size="sm" className="h-7 text-xs">
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
