import type { Meta, StoryObj } from "@storybook/react-vite";
import { BillingFields } from "./BillingFields";

const meta: Meta<typeof BillingFields> = {
  component: BillingFields,
  title: "Molecules/BillingFields",
  args: {
    paymentDelayDays: "30",
    taxRate: "20",
    billingEndOfMonth: false,
    onChange: () => {},
  },
  render: (args) => (
    <div className="grid grid-cols-2 gap-3 w-[480px]">
      <BillingFields {...args} />
    </div>
  ),
};
export default meta;
type Story = StoryObj<typeof BillingFields>;

export const Default: Story = {};

export const BillAtEndOfMonth: Story = {
  args: { billingEndOfMonth: true },
};
