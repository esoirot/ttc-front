import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { DashboardTimeEntry } from "@/types/dashboard.types";
import { RecentTimeEntries } from "./RecentTimeEntries";

function makeEntry(
  overrides: Partial<DashboardTimeEntry> = {},
): DashboardTimeEntry {
  return {
    id: 1,
    description: "Translate manual",
    startTime: "2026-06-17T09:30:00.000Z",
    durationSeconds: 3661,
    ...overrides,
  };
}

const entries: DashboardTimeEntry[] = [
  makeEntry(),
  makeEntry({
    id: 2,
    description: "Review glossary",
    startTime: "2026-06-16T14:00:00.000Z",
    durationSeconds: 1800,
  }),
  makeEntry({
    id: 3,
    description: null,
    startTime: "2026-06-16T08:15:00.000Z",
    durationSeconds: null,
  }),
];

const meta: Meta<typeof RecentTimeEntries> = {
  component: RecentTimeEntries,
  title: "Organisms/RecentTimeEntries",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <div className="max-w-md">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  args: {
    entries,
  },
};
export default meta;
type Story = StoryObj<typeof RecentTimeEntries>;

export const Default: Story = {};

export const Empty: Story = {
  args: { entries: [] },
};
