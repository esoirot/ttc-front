import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { TaskLabelPicker } from "./TaskLabelPicker";

const meta: Meta<typeof TaskLabelPicker> = {
  component: TaskLabelPicker,
  title: "Molecules/TaskLabelPicker",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <QueryClientProvider client={new QueryClient()}>
          <Story />
        </QueryClientProvider>
      </IntlProvider>
    ),
  ],
  args: {
    taskId: 1,
    open: true,
    onOpenChange: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof TaskLabelPicker>;

export const Default: Story = {};

export const Closed: Story = {
  args: { open: false },
};
