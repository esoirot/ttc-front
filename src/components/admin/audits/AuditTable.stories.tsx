import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuditTable } from "./AuditTable";

const meta: Meta<typeof AuditTable> = {
  component: AuditTable,
  title: "Organisms/AuditTable",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof AuditTable>;

export const Default: Story = {};
