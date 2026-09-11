import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { ResourceAuditHistory } from "./ResourceAuditHistory";

const meta: Meta<typeof ResourceAuditHistory> = {
  component: ResourceAuditHistory,
  title: "Organisms/ResourceAuditHistory",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <IntlProvider locale="en" messages={messages.en}>
          <Story />
        </IntlProvider>
      </QueryClientProvider>
    ),
  ],
  args: {
    open: true,
    onClose: () => {},
    resourceName: "Acme Corp",
  },
};
export default meta;
type Story = StoryObj<typeof ResourceAuditHistory>;

export const Default: Story = {};

export const Closed: Story = {
  args: { open: false },
};
