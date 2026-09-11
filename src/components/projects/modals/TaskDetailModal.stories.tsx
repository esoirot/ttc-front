import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { TaskDetailModal } from "./TaskDetailModal";

const meta: Meta<typeof TaskDetailModal> = {
  component: TaskDetailModal,
  title: "Organisms/TaskDetailModal",
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
    taskId: 4,
    projectId: 1,
    open: true,
    onClose: () => {},
    currentUserId: 1,
  },
};
export default meta;
type Story = StoryObj<typeof TaskDetailModal>;

// `useTask` fires an ungated query on mount with no MSW backend configured in
// Storybook — this renders the component's own loading skeleton state, per
// the taxonomy note on components with ungated queries.
export const Default: Story = {};

export const Closed: Story = {
  args: { open: false },
};
