import type { Meta, StoryObj } from "@storybook/react-vite";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";

const meta: Meta<typeof PasswordStrengthIndicator> = {
  component: PasswordStrengthIndicator,
  title: "Molecules/PasswordStrengthIndicator",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <Story />
      </IntlProvider>
    ),
  ],
  args: {
    password: "short",
  },
};
export default meta;
type Story = StoryObj<typeof PasswordStrengthIndicator>;

export const Default: Story = {};

export const Weak: Story = {
  args: { password: "abc123" },
};

export const Medium: Story = {
  args: { password: "abcdefgh123" },
};

export const Strong: Story = {
  args: { password: "Abcdefghijkl123" },
};

export const Empty: Story = {
  args: { password: "" },
};
