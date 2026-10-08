import type { Meta, StoryObj } from "@storybook/react-vite";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { TaskColorField } from "./TaskColorField";

const meta: Meta<typeof TaskColorField> = {
  component: TaskColorField,
  title: "Molecules/TaskColorField",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <div className="w-[280px]">
          <Story />
        </div>
      </IntlProvider>
    ),
  ],
  args: { id: "task-color", onSave: () => {} },
};
export default meta;
type Story = StoryObj<typeof TaskColorField>;

export const NoColor: Story = { args: { value: "" } };

export const WithColor: Story = { args: { value: "#EF4444" } };
