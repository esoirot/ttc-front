import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Task } from "@/types/tasks.types";
import { TasksTab } from "./TasksTab";

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: 1,
    projectId: 1,
    assigneeId: null,
    title: "Task",
    description: null,
    status: "TODO",
    dueDate: null,
    startDate: null,
    recurring: null,
    reminderOffset: null,
    sortOrder: 0,
    totalTimeSeconds: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const tasks: Task[] = [
  makeTask({ id: 1, title: "Translate homepage", status: "TODO" }),
  makeTask({
    id: 2,
    title: "Review glossary",
    status: "IN_PROGRESS",
    assigneeId: 1,
    dueDate: "2026-07-15T00:00:00.000Z",
  }),
  makeTask({
    id: 3,
    title: "Proofread footer",
    status: "DONE",
    totalTimeSeconds: 1800,
  }),
];

const memberMap: Record<number, string> = { 1: "Alex Doe" };

const meta: Meta<typeof TasksTab> = {
  component: TasksTab,
  title: "Organisms/TasksTab",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
  args: {
    projectId: 1,
    tasks,
    tasksLoading: false,
    taskHasMore: false,
    taskLoadMore: () => {},
    memberMap,
    onOpenModal: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof TasksTab>;

export const Default: Story = {};

export const Loading: Story = {
  args: { tasksLoading: true },
};

export const Empty: Story = {
  args: { tasks: [] },
};

export const HasMore: Story = {
  args: { taskHasMore: true },
};
