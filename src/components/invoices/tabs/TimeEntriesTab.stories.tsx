import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TimeEntriesTab } from "./TimeEntriesTab";

const meta: Meta<typeof TimeEntriesTab> = {
  component: TimeEntriesTab,
  title: "Organisms/TimeEntriesTab",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <div className="max-w-lg">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  args: {
    invoiceId: 1,
    alreadyAddedEntryIds: new Set<number>(),
    onAdd: () => Promise.resolve({}),
    adding: false,
  },
};
export default meta;
type Story = StoryObj<typeof TimeEntriesTab>;

export const Default: Story = {};

export const Adding: Story = {
  args: { adding: true },
};
