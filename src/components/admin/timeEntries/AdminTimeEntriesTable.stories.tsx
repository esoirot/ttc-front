import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminTimeEntriesTable } from "./AdminTimeEntriesTable";

const meta: Meta<typeof AdminTimeEntriesTable> = {
  component: AdminTimeEntriesTable,
  title: "Organisms/AdminTimeEntriesTable",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof AdminTimeEntriesTable>;

export const Default: Story = {};
