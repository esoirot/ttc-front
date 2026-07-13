import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminProjectsTable } from "./AdminProjectsTable";

const meta: Meta<typeof AdminProjectsTable> = {
  component: AdminProjectsTable,
  title: "Organisms/AdminProjectsTable",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof AdminProjectsTable>;

export const Default: Story = {};
