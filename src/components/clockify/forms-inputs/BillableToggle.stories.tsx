import type { Meta, StoryObj } from "@storybook/react-vite";
import { BillableToggle } from "./BillableToggle";

const meta: Meta<typeof BillableToggle> = {
  component: BillableToggle,
  title: "Molecules/BillableToggle",
  args: {
    billable: true,
    disabled: false,
    onChange: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof BillableToggle>;

export const Default: Story = {};

export const NonBillable: Story = { args: { billable: false } };

export const Disabled: Story = { args: { disabled: true } };
