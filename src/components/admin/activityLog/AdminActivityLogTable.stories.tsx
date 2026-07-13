import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminActivityLogTable } from "./AdminActivityLogTable";

const meta: Meta<typeof AdminActivityLogTable> = {
  component: AdminActivityLogTable,
  title: "Organisms/AdminActivityLogTable",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof AdminActivityLogTable>;

export const Default: Story = {};
