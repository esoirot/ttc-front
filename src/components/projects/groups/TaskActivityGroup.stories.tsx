import type { Meta, StoryObj } from "@storybook/react-vite";
import type { TaskActivity } from "@/types/tasks.types";
import { TaskActivityGroup } from "./TaskActivityGroup";

function makeActivity(overrides: Partial<TaskActivity> = {}): TaskActivity {
  return {
    id: 1,
    taskId: 1,
    userId: 1,
    type: "STATUS_CHANGED",
    payload: JSON.stringify({ from: "TODO", to: "IN_PROGRESS" }),
    createdAt: "2026-06-01T10:00:00.000Z",
    user: { id: 1, name: "Alice" },
    ...overrides,
  };
}

const activities: TaskActivity[] = [
  makeActivity({ id: 1, type: "CREATED", payload: null }),
  makeActivity({
    id: 2,
    type: "STATUS_CHANGED",
    payload: JSON.stringify({ from: "TODO", to: "IN_PROGRESS" }),
    createdAt: "2026-06-01T11:00:00.000Z",
  }),
  makeActivity({
    id: 3,
    type: "COMMENT_ADDED",
    payload: null,
    createdAt: "2026-06-01T12:00:00.000Z",
    user: { id: 2, name: "Bob" },
  }),
];

const meta: Meta<typeof TaskActivityGroup> = {
  component: TaskActivityGroup,
  title: "Organisms/TaskActivityGroup",
  decorators: [
    (Story) => (
      <div className="max-w-2xl border border-border rounded-md">
        <Story />
      </div>
    ),
  ],
  args: {
    taskTitle: "Translate homepage",
    activities,
  },
};
export default meta;
type Story = StoryObj<typeof TaskActivityGroup>;

export const Default: Story = {};

export const Empty: Story = {
  args: { activities: [] },
};
