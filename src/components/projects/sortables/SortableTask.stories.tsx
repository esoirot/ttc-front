import type { Meta, StoryObj } from "@storybook/react-vite";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import type { Task } from "@/types/tasks.types";
import { SortableTask } from "./SortableTask";

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
    totalTimeSeconds: 1800,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const meta: Meta<typeof SortableTask> = {
  component: SortableTask,
  title: "Organisms/SortableTask",
  decorators: [
    (Story) => (
      <DndContext>
        <SortableContext items={[1]}>
          <div className="max-w-xs">
            <Story />
          </div>
        </SortableContext>
      </DndContext>
    ),
  ],
  args: {
    task: makeTask(),
    onDelete: () => {},
    onOpenModal: () => {},
    memberMap: { 3: "Alice" },
  },
};
export default meta;
type Story = StoryObj<typeof SortableTask>;

export const Default: Story = {};

export const WithAssignee: Story = {
  args: { task: makeTask({ assigneeId: 3 }) },
};

export const Overdue: Story = {
  args: {
    task: makeTask({ assigneeId: 3, dueDate: "2026-06-01T00:00:00.000Z" }),
  },
};

export const FutureDueDate: Story = {
  args: { task: makeTask({ dueDate: "2026-12-01T00:00:00.000Z" }) },
};
