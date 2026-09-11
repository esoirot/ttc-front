import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { AdminUsersTable } from "./AdminUsersTable";

const meta: Meta<typeof AdminUsersTable> = {
  component: AdminUsersTable,
  title: "Organisms/AdminUsersTable",
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
type Story = StoryObj<typeof AdminUsersTable>;

export const Default: Story = {};
