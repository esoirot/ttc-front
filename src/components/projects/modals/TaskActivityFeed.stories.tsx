import type { Meta, StoryObj } from "@storybook/react-vite";
import { TaskActivityFeed } from "./TaskActivityFeed";
import type { TaskActivity } from "@/types/tasks.types";

const activities: TaskActivity[] = [
  {
    id: 1,
    taskId: 1,
    userId: 1,
    type: "CREATED",
    payload: null,
    createdAt: "2026-07-01T09:00:00.000Z",
    user: { id: 1, name: "Ada Lovelace" },
  },
  {
    id: 2,
    taskId: 1,
    userId: 1,
    type: "STATUS_CHANGED",
    payload: JSON.stringify({ from: "TODO", to: "IN_PROGRESS" }),
    createdAt: "2026-07-02T10:30:00.000Z",
    user: { id: 1, name: "Ada Lovelace" },
  },
  {
    id: 3,
    taskId: 1,
    userId: 2,
    type: "COMMENT_ADDED",
    payload: null,
    createdAt: "2026-07-03T14:15:00.000Z",
    user: { id: 2, name: "Grace Hopper" },
  },
  {
    id: 4,
    taskId: 1,
    userId: 2,
    type: "DUE_DATE_SET",
    payload: JSON.stringify({ to: "2026-07-15T00:00:00.000Z" }),
    createdAt: "2026-07-03T14:20:00.000Z",
    user: { id: 2, name: "Grace Hopper" },
  },
];

const meta: Meta<typeof TaskActivityFeed> = {
  component: TaskActivityFeed,
  title: "Molecules/TaskActivityFeed",
  args: {
    activities,
  },
};
export default meta;
type Story = StoryObj<typeof TaskActivityFeed>;

export const Default: Story = {};

export const Empty: Story = {
  args: { activities: [] },
};
