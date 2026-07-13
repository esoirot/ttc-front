import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type {
  ClockifyProject,
  ClockifyTag,
  ClockifyTimeEntry,
} from "@/types/clockify.types";
import { DayGroup } from "./DayGroup";

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
];

function makeEntry(
  overrides: Partial<ClockifyTimeEntry> = {},
): ClockifyTimeEntry {
  return {
    id: "e1",
    description: "Translate homepage copy",
    projectId: "p1",
    tagIds: ["t1"],
    timeInterval: {
      start: "2026-06-24T09:00:00.000Z",
      end: "2026-06-24T10:30:00.000Z",
      duration: null,
    },
    workspaceId: "ws-1",
    billable: true,
    ...overrides,
  };
}

const entries: ClockifyTimeEntry[] = [
  makeEntry({ id: "e1" }),
  makeEntry({
    id: "e2",
    description: "Translate homepage copy",
    timeInterval: {
      start: "2026-06-24T11:00:00.000Z",
      end: "2026-06-24T11:45:00.000Z",
      duration: null,
    },
  }),
  makeEntry({
    id: "e3",
    description: "Review contract draft",
    projectId: "p2",
    tagIds: [],
    billable: false,
    timeInterval: {
      start: "2026-06-24T13:00:00.000Z",
      end: "2026-06-24T13:20:00.000Z",
      duration: null,
    },
  }),
];

const meta: Meta<typeof DayGroup> = {
  component: DayGroup,
  title: "Organisms/DayGroup",
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
    dayKey: "2026-06-24",
    entries,
    projects,
    tags,
    billabilityLocked: false,
    onDelete: () => {},
    onResume: () => {},
    onUpdate: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof DayGroup>;

export const Default: Story = {};

export const BillabilityLocked: Story = {
  args: { billabilityLocked: true },
};
