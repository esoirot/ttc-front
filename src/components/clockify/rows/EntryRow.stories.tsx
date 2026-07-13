import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type {
  ClockifyProject,
  ClockifyTag,
  ClockifyTimeEntry,
} from "@/types/clockify.types";
import { EntryRow } from "./EntryRow";

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

const meta: Meta<typeof EntryRow> = {
  component: EntryRow,
  title: "Organisms/EntryRow",
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
    projects,
    tags,
    billabilityLocked: false,
    onDelete: () => {},
    onResume: () => {},
    onUpdate: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof EntryRow>;

export const Default: Story = { args: { entry: makeEntry() } };

export const Running: Story = {
  args: {
    entry: makeEntry({
      timeInterval: {
        start: "2026-06-24T09:00:00.000Z",
        end: null,
        duration: null,
      },
    }),
  },
};

export const NoDescription: Story = {
  args: {
    entry: makeEntry({ description: null, projectId: null, tagIds: [] }),
  },
};

export const BillabilityLocked: Story = {
  args: { entry: makeEntry(), billabilityLocked: true },
};
