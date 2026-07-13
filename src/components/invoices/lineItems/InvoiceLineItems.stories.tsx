import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { InvoiceItem } from "@/types/invoices.types";
import { InvoiceLineItems } from "./InvoiceLineItems";

function makeItem(overrides: Partial<InvoiceItem> = {}): InvoiceItem {
  return {
    id: 1,
    invoiceId: 4,
    projectId: null,
    timeEntryId: null,
    description: "Translation",
    quantity: 1000,
    unitPrice: 0.05,
    total: 50,
    ...overrides,
  };
}

const items: InvoiceItem[] = [
  makeItem({ id: 1, description: "Translation — homepage copy" }),
  makeItem({
    id: 2,
    description: "Proofreading",
    quantity: 2,
    unitPrice: 40,
    total: 80,
    timeEntryId: 10,
  }),
];

const meta: Meta<typeof InvoiceLineItems> = {
  component: InvoiceLineItems,
  title: "Organisms/InvoiceLineItems",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <div className="max-w-2xl">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  args: {
    invoiceId: 4,
    items,
    onAddItem: () => Promise.resolve({}),
    onUpdateItem: () => Promise.resolve({}),
    onRemoveItem: () => {},
    adding: false,
  },
};
export default meta;
type Story = StoryObj<typeof InvoiceLineItems>;

export const Default: Story = {};

export const Empty: Story = {
  args: { items: [] },
};
