import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SecurityTab } from "./SecurityTab";

const meta: Meta<typeof SecurityTab> = {
  component: SecurityTab,
  title: "Organisms/SecurityTab",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <div className="max-w-md">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof SecurityTab>;

export const Default: Story = {};
