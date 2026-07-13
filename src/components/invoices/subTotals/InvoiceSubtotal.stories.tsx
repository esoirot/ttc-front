import type { Meta, StoryObj } from "@storybook/react-vite";
import { InvoiceSubtotal } from "./InvoiceSubtotal";

const items = [
  {
    id: 1,
    invoiceId: 1,
    projectId: null,
    timeEntryId: null,
    description: "Translation - manual",
    quantity: 1,
    unitPrice: 320,
    total: 320,
  },
  {
    id: 2,
    invoiceId: 1,
    projectId: null,
    timeEntryId: null,
    description: "Proofreading",
    quantity: 2,
    unitPrice: 90,
    total: 180,
  },
];

const meta: Meta<typeof InvoiceSubtotal> = {
  component: InvoiceSubtotal,
  title: "Molecules/InvoiceSubtotal",
  args: {
    items,
    currency: "USD",
  },
};
export default meta;
type Story = StoryObj<typeof InvoiceSubtotal>;

export const Default: Story = {};

export const Empty: Story = { args: { items: [], currency: "EUR" } };
