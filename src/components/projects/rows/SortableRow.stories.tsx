import type { Meta, StoryObj } from "@storybook/react-vite";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import type { Task } from "@/types/tasks.types";
import { SortableRow } from "./SortableRow";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    projectId: 1,
    assigneeId: null,
    title: "Translate homepage copy",
    description: null,
    status: "TODO",
    dueDate: null,
    startDate: null,
    recurring: null,
    reminderOffset: null,
    sortOrder: 0,
    totalTimeSeconds: 3600,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const meta: Meta<typeof SortableRow> = {
  component: SortableRow,
  title: "Organisms/SortableRow",
  decorators: [
    (Story) => (
      <DndContext>
        <SortableContext items={[1]}>
          <div className="max-w-xl">
            <Story />
          </div>
        </SortableContext>
      </DndContext>
    ),
  ],
  args: {
    task: makeTask(),
    selected: false,
    onSelect: () => {},
    onOpenModal: () => {},
    onDelete: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof SortableRow>;

export const Default: Story = {};

export const Selected: Story = {
  args: { selected: true },
};

export const WithDueDate: Story = {
  args: { task: makeTask({ dueDate: "2026-07-01T00:00:00.000Z" }) },
};

export const Done: Story = {
  args: { task: makeTask({ status: "DONE" }) },
};
