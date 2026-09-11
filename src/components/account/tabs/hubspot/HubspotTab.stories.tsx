import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { HubspotTab } from "./HubspotTab";

const meta: Meta<typeof HubspotTab> = {
  component: HubspotTab,
  title: "Organisms/HubspotTab",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <QueryClientProvider client={new QueryClient()}>
          <div className="max-w-2xl">
            <Story />
          </div>
        </QueryClientProvider>
      </IntlProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof HubspotTab>;

export const Default: Story = {};
