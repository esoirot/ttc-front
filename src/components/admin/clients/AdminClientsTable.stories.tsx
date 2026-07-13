import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminClientsTable } from "./AdminClientsTable";

const meta: Meta<typeof AdminClientsTable> = {
  component: AdminClientsTable,
  title: "Organisms/AdminClientsTable",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof AdminClientsTable>;

export const Default: Story = {};
