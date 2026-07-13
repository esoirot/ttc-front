import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type {
  ClockifyProject,
  ClockifyTag,
  ClockifyTimeEntry,
} from "@/types/clockify.types";
import { DescriptionGroup } from "./DescriptionGroup";

const projects: ClockifyProject[] = [
  {
    id: "p1",
    name: "Website copy",
    color: "#3b82f6",
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
    timeInterval: {
      start: "2026-06-24T11:00:00.000Z",
      end: "2026-06-24T11:45:00.000Z",
      duration: null,
    },
  }),
  makeEntry({
    id: "e3",
    timeInterval: {
      start: "2026-06-24T13:00:00.000Z",
      end: "2026-06-24T13:20:00.000Z",
      duration: null,
    },
  }),
];

const meta: Meta<typeof DescriptionGroup> = {
  component: DescriptionGroup,
  title: "Organisms/DescriptionGroup",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <div className="max-w-2xl border border-border rounded-md">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  args: {
    workspaceId: "ws-1",
    description: "Translate homepage copy",
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
type Story = StoryObj<typeof DescriptionGroup>;

export const Default: Story = {};

export const NoDescription: Story = {
  args: { description: "" },
};

export const BillabilityLocked: Story = {
  args: { billabilityLocked: true },
};
