import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { TimeEntry } from "@/types/time-entries.types";
import type { Project } from "@/types/projects.types";
import { EntryList } from "./EntryList";

const project: Project = {
  id: 1,
  userId: 1,
  clientId: null,
  title: "Website copy",
  description: null,
  status: "ACTIVE",
  sourceLanguage: null,
  targetLanguage: null,
  wordCount: null,
  unitPrice: null,
  fixedFee: null,
  hourlyRate: null,
  perWordRate: null,
  currency: "EUR",
  deadline: null,
  startDate: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const tags = [
  { id: 1, name: "Urgent" },
  { id: 2, name: "Client review" },
];

function makeEntry(overrides: Partial<TimeEntry> = {}): TimeEntry {
  return {
    id: 1,
    userId: 1,
    projectId: project.id,
    description: "Translate homepage copy",
    startTime: "2026-06-01T08:00:00.000Z",
    endTime: "2026-06-01T09:30:00.000Z",
    durationSeconds: 5400,
    billable: true,
    clockifyEntryId: null,
    tags: [{ id: 1, name: "Urgent" }],
    createdAt: "2026-06-01T08:00:00.000Z",
    updatedAt: "2026-06-01T09:30:00.000Z",
    ...overrides,
  };
}

const entries: TimeEntry[] = [
  makeEntry({ id: 1 }),
  makeEntry({
    id: 2,
    description: "Review glossary terms",
    startTime: "2026-05-30T10:00:00.000Z",
    endTime: "2026-05-30T10:45:00.000Z",
    durationSeconds: 2700,
    tags: [],
  }),
];

const meta: Meta<typeof EntryList> = {
  component: EntryList,
  title: "Organisms/EntryList",
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
    entries,
    loading: false,
    hasMore: false,
    loadMore: () => {},
    deleteTimeEntry: () => Promise.resolve(),
    projects: [project],
    tags,
    onResume: () => {},
    onUpdate: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof EntryList>;

export const Default: Story = {};

export const Loading: Story = {
  args: { entries: [], loading: true },
};

export const Empty: Story = {
  args: { entries: [], loading: false },
};

export const HasMore: Story = {
  args: { hasMore: true },
};
