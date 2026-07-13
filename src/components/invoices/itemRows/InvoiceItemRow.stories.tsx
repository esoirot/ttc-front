import type { Meta, StoryObj } from "@storybook/react-vite";
import type { InvoiceItem } from "@/types/invoices.types";
import { InvoiceItemRow } from "./InvoiceItemRow";

function makeItem(overrides: Partial<InvoiceItem> = {}): InvoiceItem {
  return {
    id: 1,
    invoiceId: 1,
    projectId: 1,
    timeEntryId: null,
    description: "Website copy translation",
    quantity: 10,
    unitPrice: 25,
    total: 250,
    ...overrides,
  };
}

const meta: Meta<typeof InvoiceItemRow> = {
  component: InvoiceItemRow,
  title: "Organisms/InvoiceItemRow",
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
  args: {
    editState: { desc: "", qty: "", price: "" },
    onStartEdit: () => {},
    onChangeDesc: () => {},
    onChangeQty: () => {},
    onChangePrice: () => {},
    onSave: () => {},
    onCancel: () => {},
    onRemove: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof InvoiceItemRow>;

export const Default: Story = {
  args: { item: makeItem(), editing: false },
};

export const FromTimeEntry: Story = {
  args: { item: makeItem({ timeEntryId: 42 }), editing: false },
};

export const Editing: Story = {
  args: {
    item: makeItem(),
    editing: true,
    editState: { desc: "Website copy translation", qty: "10", price: "25" },
  },
};
