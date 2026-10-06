import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { TaskPicker } from "./TaskPicker";

const meta: Meta<typeof TaskPicker> = {
  component: TaskPicker,
  title: "Molecules/TaskPicker",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <IntlProvider locale="en" messages={messages.en}>
          <div className="w-64">
            <Story />
          </div>
        </IntlProvider>
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof TaskPicker>;

function Picker() {
  const [value, setValue] = useState("");
  return (
    <TaskPicker
      projectId={1}
      value={value}
      onChange={setValue}
      placeholder="No task"
      noneLabel="No task"
    />
  );
}

export const Default: Story = { render: () => <Picker /> };
