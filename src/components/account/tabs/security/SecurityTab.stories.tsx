import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { SecurityTab } from "./SecurityTab";

const meta: Meta<typeof SecurityTab> = {
  component: SecurityTab,
  title: "Organisms/SecurityTab",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <IntlProvider locale="en" messages={messages.en}>
          <div className="max-w-md">
            <Story />
          </div>
        </IntlProvider>
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof SecurityTab>;

export const Default: Story = {};
