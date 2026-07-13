import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import type { Invoice } from "@/types/invoices.types";
import { InvoiceRow } from "./InvoiceRow";

function makeInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: 1,
    userId: 1,
    clientId: 1,
    number: "INV-2026-0001",
    status: "SENT",
    currency: "EUR",
    issuedAt: "2026-06-01T00:00:00.000Z",
    dueDate: "2026-06-30T00:00:00.000Z",
    paidAt: null,
    notes: null,
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    items: [
      {
        id: 1,
        invoiceId: 1,
        projectId: 1,
        timeEntryId: null,
        description: "Website copy translation",
        quantity: 10,
        unitPrice: 45,
        total: 450,
      },
    ],
    ...overrides,
  };
}

const meta: Meta<typeof InvoiceRow> = {
  component: InvoiceRow,
  title: "Organisms/InvoiceRow",
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="max-w-md">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof InvoiceRow>;

export const Default: Story = { args: { inv: makeInvoice() } };

export const Draft: Story = {
  args: {
    inv: makeInvoice({
      status: "DRAFT",
      issuedAt: null,
      dueDate: null,
    }),
  },
};

export const Paid: Story = {
  args: {
    inv: makeInvoice({ status: "PAID", paidAt: "2026-06-15T00:00:00.000Z" }),
  },
};

export const Overdue: Story = {
  args: { inv: makeInvoice({ status: "OVERDUE" }) },
};
