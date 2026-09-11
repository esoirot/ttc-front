import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { TwoFactorSetupFlow } from "./TwoFactorSetupFlow";

const meta: Meta<typeof TwoFactorSetupFlow> = {
  component: TwoFactorSetupFlow,
  title: "Organisms/TwoFactorSetupFlow",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <QueryClientProvider client={new QueryClient()}>
          <div className="max-w-sm">
            <Story />
          </div>
        </QueryClientProvider>
      </IntlProvider>
    ),
  ],
  args: {
    onEnabled: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof TwoFactorSetupFlow>;

export const Default: Story = {};
