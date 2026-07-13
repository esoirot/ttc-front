import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminInvoicesTable } from "./AdminInvoicesTable";

const meta: Meta<typeof AdminInvoicesTable> = {
  component: AdminInvoicesTable,
  title: "Organisms/AdminInvoicesTable",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof AdminInvoicesTable>;

export const Default: Story = {};
