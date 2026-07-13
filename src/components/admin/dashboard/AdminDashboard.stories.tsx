import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminDashboard } from "./AdminDashboard";

const meta: Meta<typeof AdminDashboard> = {
  component: AdminDashboard,
  title: "Organisms/AdminDashboard",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof AdminDashboard>;

export const Default: Story = {};
