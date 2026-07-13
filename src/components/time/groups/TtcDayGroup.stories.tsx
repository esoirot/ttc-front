import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { TimeEntry } from "@/types/time-entries.types";
import type { Project } from "@/types/projects.types";
import { TtcDayGroup } from "./TtcDayGroup";

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
    startTime: "2026-06-01T10:00:00.000Z",
    endTime: "2026-06-01T10:45:00.000Z",
    durationSeconds: 2700,
    tags: [],
  }),
  makeEntry({
    id: 3,
    description: "Translate homepage copy",
    startTime: "2026-06-01T11:00:00.000Z",
    endTime: "2026-06-01T11:20:00.000Z",
    durationSeconds: 1200,
  }),
];

const meta: Meta<typeof TtcDayGroup> = {
  component: TtcDayGroup,
  title: "Organisms/TtcDayGroup",
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
    dayKey: "2026-06-01",
    entries,
    projects: [project],
    tags,
    onDelete: () => {},
    onResume: () => {},
    onUpdate: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof TtcDayGroup>;

export const Default: Story = {};

export const SingleEntry: Story = {
  args: { entries: [makeEntry({ id: 1 })] },
};
