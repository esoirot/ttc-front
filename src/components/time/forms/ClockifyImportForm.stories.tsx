import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClockifyImportForm } from "./ClockifyImportForm";

const meta: Meta<typeof ClockifyImportForm> = {
  component: ClockifyImportForm,
  title: "Molecules/ClockifyImportForm",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  args: {
    workspaceId: "ws-1",
    refetch: () => {},
    onClose: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof ClockifyImportForm>;

export const Default: Story = {};
