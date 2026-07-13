import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleCalendarTab } from "./GoogleCalendarTab";

const meta: Meta<typeof GoogleCalendarTab> = {
  component: GoogleCalendarTab,
  title: "Organisms/GoogleCalendarTab",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <div className="max-w-2xl">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof GoogleCalendarTab>;

export const Default: Story = {};
