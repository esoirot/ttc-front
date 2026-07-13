import type { Meta, StoryObj } from "@storybook/react-vite";
import { RowDeleteButton } from "./RowDeleteButton";

const meta: Meta<typeof RowDeleteButton> = {
  component: RowDeleteButton,
  title: "Molecules/RowDeleteButton",
  args: {
    onDelete: () => {},
    title: "Delete client?",
    description: "This cannot be undone.",
    ariaLabel: "Delete client",
  },
};
export default meta;
type Story = StoryObj<typeof RowDeleteButton>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
