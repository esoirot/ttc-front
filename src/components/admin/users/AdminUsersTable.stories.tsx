import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminUsersTable } from "./AdminUsersTable";

const meta: Meta<typeof AdminUsersTable> = {
  component: AdminUsersTable,
  title: "Organisms/AdminUsersTable",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof AdminUsersTable>;

export const Default: Story = {};
