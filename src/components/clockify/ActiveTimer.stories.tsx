import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ClockifyProject, ClockifyTag } from "@/types/clockify.types";
import { ActiveTimer } from "./ActiveTimer";

const projects: ClockifyProject[] = [
  {
    id: "p1",
    name: "Website copy",
    color: "#3b82f6",
    archived: false,
    clientId: null,
  },
  {
    id: "p2",
    name: "Contracts",
    color: "#22c55e",
    archived: false,
    clientId: null,
  },
];

const tags: ClockifyTag[] = [
  { id: "t1", name: "Urgent", workspaceId: "ws-1", archived: false },
  { id: "t2", name: "Client review", workspaceId: "ws-1", archived: false },
];

const meta: Meta<typeof ActiveTimer> = {
  component: ActiveTimer,
  title: "Organisms/ActiveTimer",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <div className="max-w-2xl">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  args: {
    workspaceId: "ws-1",
    projects,
    tags,
    billabilityLocked: false,
    recentDescriptions: ["Translate homepage copy", "Review contract draft"],
  },
};
export default meta;
type Story = StoryObj<typeof ActiveTimer>;

export const Default: Story = {};

export const BillabilityLocked: Story = {
  args: { billabilityLocked: true },
};
