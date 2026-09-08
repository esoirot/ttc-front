import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { TaskSortField, TaskSortDirection } from "@/types/tasks.types";
import { TaskSortControls } from "./TaskSortControls";

function Interactive() {
  const [field, setField] = useState<TaskSortField>("dueDate");
  const [direction, setDirection] = useState<TaskSortDirection>("desc");
  return (
    <div className="flex items-center gap-3">
      <TaskSortControls
        field={field}
        direction={direction}
        onFieldChange={setField}
        onDirectionChange={setDirection}
        idPrefix="story"
      />
    </div>
  );
}

const meta: Meta<typeof TaskSortControls> = {
  component: TaskSortControls,
  title: "Molecules/TaskSortControls",
};
export default meta;
type Story = StoryObj<typeof TaskSortControls>;

export const Default: Story = {
  render: () => <Interactive />,
};
