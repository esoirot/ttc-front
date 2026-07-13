import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClockifyTab } from "./ClockifyTab";

const meta: Meta<typeof ClockifyTab> = {
  component: ClockifyTab,
  title: "Organisms/ClockifyTab",
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
type Story = StoryObj<typeof ClockifyTab>;

export const Default: Story = {};
