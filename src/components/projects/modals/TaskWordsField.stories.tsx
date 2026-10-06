import type { Meta, StoryObj } from "@storybook/react-vite";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { TaskWordsField } from "./TaskWordsField";

const meta: Meta<typeof TaskWordsField> = {
  component: TaskWordsField,
  title: "Molecules/TaskWordsField",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <Story />
      </IntlProvider>
    ),
  ],
  args: { id: "task-words", onSave: () => {} },
};
export default meta;
type Story = StoryObj<typeof TaskWordsField>;

export const WithWords: Story = { args: { value: 500 } };

export const Empty: Story = { args: { value: null } };
