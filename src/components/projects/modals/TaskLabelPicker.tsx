import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
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
  open: openProp,
  onOpenChange,
}: {
  taskId: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const intl = useIntl();
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = onOpenChange ?? setOpenState;
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
          <FormattedMessage
            id="projects.taskLabelPicker.addLabel"
            defaultMessage="+ Add label"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3 flex flex-col gap-3" align="start">
        <Input
          placeholder={intl.formatMessage({
            id: "projects.taskLabelPicker.labelNamePlaceholder",
            defaultMessage: "Label name…",
          })}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleAdd();
          }}
          className="h-7 text-xs"
        />
        <div className="flex flex-wrap gap-1.5">
          {PRESET_COLORS.map((c) => (
            <Button
              key={c}
              variant="ghost"
              style={{ backgroundColor: c }}
              className={`size-6 rounded-full p-0 hover:scale-110 ${color === c ? "ring-2 ring-offset-1 ring-foreground scale-110" : ""}`}
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
          <FormattedMessage
            id="projects.taskLabelPicker.add"
            defaultMessage="Add"
          />
        </Button>
      </PopoverContent>
    </Popover>
  );
}
