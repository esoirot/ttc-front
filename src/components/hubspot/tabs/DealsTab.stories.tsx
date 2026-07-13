import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DealsTab } from "./DealsTab";

const meta: Meta<typeof DealsTab> = {
  component: DealsTab,
  title: "Organisms/DealsTab",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <div className="max-w-4xl">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof DealsTab>;

export const Default: Story = {};
