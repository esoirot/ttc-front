import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { AdminInvoicesTable } from "./AdminInvoicesTable";

const meta: Meta<typeof AdminInvoicesTable> = {
  component: AdminInvoicesTable,
  title: "Organisms/AdminInvoicesTable",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <IntlProvider locale="en" messages={messages.en}>
          <Story />
        </IntlProvider>
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof AdminInvoicesTable>;

export const Default: Story = {};
