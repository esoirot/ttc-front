import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import type { Invoice } from "@/types/invoices.types";
import { InvoiceListCard } from "./InvoiceListCard";

function makeInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: 1,
    userId: 1,
    clientId: 1,
    number: "INV-0001",
    status: "SENT",
    currency: "EUR",
    issuedAt: "2026-06-01T00:00:00.000Z",
    dueDate: "2026-06-15T00:00:00.000Z",
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
        unitPrice: 25,
        total: 250,
      },
    ],
    ...overrides,
  };
}

const meta: Meta<typeof InvoiceListCard> = {
  component: InvoiceListCard,
  title: "Organisms/InvoiceListCard",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <MemoryRouter>
          <div className="max-w-md">
            <Story />
          </div>
        </MemoryRouter>
      </IntlProvider>
    ),
  ],
  args: {
    inv: makeInvoice(),
    clientName: "Acme Corp",
  },
};
export default meta;
type Story = StoryObj<typeof InvoiceListCard>;

export const Default: Story = {};

export const NoClient: Story = {
  args: { inv: makeInvoice({ clientId: null }), clientName: undefined },
};

export const Draft: Story = {
  args: { inv: makeInvoice({ status: "DRAFT", dueDate: null }) },
};

export const Overdue: Story = {
  args: { inv: makeInvoice({ status: "OVERDUE" }) },
};
