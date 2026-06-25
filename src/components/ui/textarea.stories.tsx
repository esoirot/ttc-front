import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "./textarea";

const meta: Meta<typeof Textarea> = {
  component: Textarea,
  title: "ui/Textarea",
  args: { placeholder: "Add a description..." },
};
export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { defaultValue: "Translation project for the Q3 client deliverable." },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Locked" },
};
