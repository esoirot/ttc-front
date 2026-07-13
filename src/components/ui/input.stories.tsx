import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./input";

const meta: Meta<typeof Input> = {
  component: Input,
  title: "Atoms/Input",
  args: { placeholder: "Type something..." },
};
export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const WithValue: Story = { args: { defaultValue: "Acme Corp" } };

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Locked" },
};

export const Invalid: Story = {
  args: { "aria-invalid": true, defaultValue: "bad@" },
};
