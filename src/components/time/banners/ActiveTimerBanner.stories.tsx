import type { Meta, StoryObj } from "@storybook/react-vite";
import type { TimeEntry } from "@/types/time-entries.types";
import { ActiveTimerBanner } from "./ActiveTimerBanner";

function makeActiveTimer(overrides: Partial<TimeEntry> = {}): TimeEntry {
  return {
    id: 1,
    userId: 1,
    projectId: 1,
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

const meta: Meta<typeof ActiveTimerBanner> = {
  component: ActiveTimerBanner,
  title: "Organisms/ActiveTimerBanner",
  args: {
    activeTimer: makeActiveTimer(),
    stopTimer: () => Promise.resolve(),
    stopping: false,
    refetch: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof ActiveTimerBanner>;

export const Default: Story = {};

export const NoDescription: Story = {
  args: {
    activeTimer: makeActiveTimer({ description: null, tags: [] }),
  },
};

export const Stopping: Story = {
  args: { stopping: true },
};
