import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { TimeEntry } from "@/types/time-entries.types";
import type { Project } from "@/types/projects.types";
import { TimerSection } from "./TimerSection";

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

function makeActiveTimer(overrides: Partial<TimeEntry> = {}): TimeEntry {
  return {
    id: 1,
    userId: 1,
    projectId: project.id,
    description: "Translate homepage copy",
    startTime: "2026-06-01T08:00:00.000Z",
    endTime: null,
    durationSeconds: null,
    billable: true,
    clockifyEntryId: null,
    tags: [{ id: 1, name: "Urgent" }],
    createdAt: "2026-06-01T08:00:00.000Z",
    updatedAt: "2026-06-01T08:00:00.000Z",
    ...overrides,
  };
}

const meta: Meta<typeof TimerSection> = {
  component: TimerSection,
  title: "Organisms/TimerSection",
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
    activeTimer: null,
    stopTimer: () => Promise.resolve(),
    stopping: false,
    refetch: () => {},
    projects: [project],
    tags,
    recentDescriptions: ["Translate homepage copy", "Review glossary terms"],
  },
};
export default meta;
type Story = StoryObj<typeof TimerSection>;

export const Idle: Story = {};

export const Running: Story = {
  args: { activeTimer: makeActiveTimer() },
};

export const WithInitialTask: Story = {
  args: {
    activeTimer: null,
    initialProjectId: project.id,
    initialTaskId: 5,
    initialTaskTitle: "Proofread chapter 3",
  },
};
