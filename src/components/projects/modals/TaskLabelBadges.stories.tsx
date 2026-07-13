import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TaskLabelBadges } from "./TaskLabelBadges";
import type { TaskLabel } from "@/types/tasks.types";

const labels: TaskLabel[] = [
  {
    id: 1,
    taskId: 1,
    name: "Urgent",
    color: "#EF4444",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    taskId: 1,
    name: "Client review",
    color: "#3B82F6",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 3,
    taskId: 1,
    name: "Internal",
    color: "#6B7280",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

const meta: Meta<typeof TaskLabelBadges> = {
  component: TaskLabelBadges,
  title: "Molecules/TaskLabelBadges",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  args: {
    taskId: 1,
    labels,
  },
};
export default meta;
type Story = StoryObj<typeof TaskLabelBadges>;

export const Default: Story = {};

export const SingleLabel: Story = {
  args: { labels: [labels[0]] },
};

export const Empty: Story = {
  args: { labels: [] },
};
