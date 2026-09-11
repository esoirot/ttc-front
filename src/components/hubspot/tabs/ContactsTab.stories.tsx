import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { ContactsTab } from "./ContactsTab";

const meta: Meta<typeof ContactsTab> = {
  component: ContactsTab,
  title: "Organisms/HubspotContactsTab",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <QueryClientProvider client={new QueryClient()}>
          <div className="max-w-4xl">
            <Story />
          </div>
        </QueryClientProvider>
      </IntlProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof ContactsTab>;

export const Default: Story = {};
