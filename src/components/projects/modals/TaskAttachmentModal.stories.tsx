import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { TaskAttachmentModal } from "./TaskAttachmentModal";

const meta: Meta<typeof TaskAttachmentModal> = {
  component: TaskAttachmentModal,
  title: "Molecules/TaskAttachmentModal",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <IntlProvider locale="en" messages={messages.en}>
          <Story />
        </IntlProvider>
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
