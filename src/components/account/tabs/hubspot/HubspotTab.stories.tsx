import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HubspotTab } from "./HubspotTab";

const meta: Meta<typeof HubspotTab> = {
  component: HubspotTab,
  title: "Organisms/HubspotTab",
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
type Story = StoryObj<typeof HubspotTab>;

export const Default: Story = {};
