import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CreateEventDialog } from "./CreateEventDialog";

const meta: Meta<typeof CreateEventDialog> = {
  component: CreateEventDialog,
  title: "Molecules/CreateEventDialog",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  args: {
    defaultDate: new Date(2026, 6, 9),
  },
};
export default meta;
type Story = StoryObj<typeof CreateEventDialog>;

export const Default: Story = {};
