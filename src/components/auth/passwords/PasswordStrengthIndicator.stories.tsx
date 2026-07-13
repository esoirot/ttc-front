import type { Meta, StoryObj } from "@storybook/react-vite";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";

const meta: Meta<typeof PasswordStrengthIndicator> = {
  component: PasswordStrengthIndicator,
  title: "Molecules/PasswordStrengthIndicator",
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
