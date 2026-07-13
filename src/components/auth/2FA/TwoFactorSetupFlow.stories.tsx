import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TwoFactorSetupFlow } from "./TwoFactorSetupFlow";

const meta: Meta<typeof TwoFactorSetupFlow> = {
  component: TwoFactorSetupFlow,
  title: "Organisms/TwoFactorSetupFlow",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <div className="max-w-sm">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  args: {
    onEnabled: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof TwoFactorSetupFlow>;

export const Default: Story = {};
