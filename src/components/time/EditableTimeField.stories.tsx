import type { Meta, StoryObj } from "@storybook/react-vite";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { EditableTimeField } from "./EditableTimeField";

const meta: Meta<typeof EditableTimeField> = {
  component: EditableTimeField,
  title: "Molecules/EditableTimeField",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <Story />
      </IntlProvider>
    ),
  ],
  args: {
    iso: "2026-06-01T08:30:15.000Z",
    label: "start time",
    onCommit: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof EditableTimeField>;

export const Default: Story = {};

export const WithValidation: Story = {
  args: {
    label: "end time",
    isValid: () => true,
  },
};
