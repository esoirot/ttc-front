import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectionsTable } from "./ConnectionsTable";

const meta: Meta<typeof ConnectionsTable> = {
  component: ConnectionsTable,
  title: "Organisms/ConnectionsTable",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof ConnectionsTable>;

export const Default: Story = {};
