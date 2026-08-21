import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Task, TaskActivity } from "@/types/tasks.types";
import { ActivityTab } from "./ActivityTab";

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

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    projectId: 1,
    assigneeId: null,
    title: "Translate homepage",
    description: null,
    status: "TODO",
    dueDate: null,
    startDate: null,
    recurring: null,
    reminderOffset: null,
    sortOrder: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const tasks: Task[] = [
  makeTask({
    id: 1,
    title: "Translate homepage",
    activities: [
      makeActivity({
        id: 1,
        taskId: 1,
        type: "CREATED",
        payload: null,
        createdAt: "2026-06-01T09:00:00.000Z",
      }),
      makeActivity({
        id: 2,
        taskId: 1,
        type: "STATUS_CHANGED",
        payload: JSON.stringify({ from: "TODO", to: "IN_PROGRESS" }),
        createdAt: "2026-06-01T10:00:00.000Z",
      }),
    ],
  }),
  makeTask({
    id: 2,
    title: "Proofread footer",
    activities: [
      makeActivity({
        id: 3,
        taskId: 2,
        type: "COMMENT_ADDED",
        payload: null,
        createdAt: "2026-06-01T11:00:00.000Z",
        user: { id: 2, name: "Bob" },
      }),
    ],
  }),
  makeTask({ id: 3, title: "Untouched task", activities: [] }),
];

const meta: Meta<typeof ActivityTab> = {
  component: ActivityTab,
  title: "Organisms/ProjectActivityTab",
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
  args: {
    tasks,
    tasksLoading: false,
  },
};
export default meta;
type Story = StoryObj<typeof ActivityTab>;

export const Default: Story = {};

export const Loading: Story = { args: { tasks: [], tasksLoading: true } };

export const Empty: Story = {
  args: { tasks: [makeTask({ activities: [] })] },
};
