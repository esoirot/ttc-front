import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TaskAttachmentModal } from "./TaskAttachmentModal";

const meta: Meta<typeof TaskAttachmentModal> = {
  component: TaskAttachmentModal,
  title: "Molecules/TaskAttachmentModal",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  args: {
    taskId: 1,
    open: true,
    onClose: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof TaskAttachmentModal>;

export const Default: Story = {};

export const Closed: Story = {
  args: { open: false },
};
