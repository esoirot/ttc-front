import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { TimeEntry } from "@/types/time-entries.types";
import type { Project } from "@/types/projects.types";
import { TtcDescriptionGroup } from "./TtcDescriptionGroup";

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
    startTime: "2026-06-01T10:00:00.000Z",
    endTime: "2026-06-01T10:45:00.000Z",
    durationSeconds: 2700,
    tags: [],
  }),
];

const meta: Meta<typeof TtcDescriptionGroup> = {
  component: TtcDescriptionGroup,
  title: "Organisms/TtcDescriptionGroup",
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
    description: "Translate homepage copy",
    entries,
    projects: [project],
    tags,
    onDelete: () => {},
    onResume: () => {},
    onUpdate: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof TtcDescriptionGroup>;

export const Default: Story = {};

export const NoDescription: Story = {
  args: { description: "" },
};
