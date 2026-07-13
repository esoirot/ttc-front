import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import type { Invoice } from "@/types/invoices.types";
import { ActivityTab } from "./ActivityTab";

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

const meta: Meta<typeof ActivityTab> = {
  component: ActivityTab,
  title: "Organisms/ActivityTab",
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="max-w-lg">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  args: {
    invoicesLoading: false,
    timeLoading: false,
    hasProjects: true,
    totalSeconds: 9045,
  },
};
export default meta;
type Story = StoryObj<typeof ActivityTab>;

export const Default: Story = {
  args: {
    invoices: [
      makeInvoice(),
      makeInvoice({
        id: 2,
        number: "INV-2026-0002",
        status: "PAID",
        paidAt: "2026-06-20T00:00:00.000Z",
      }),
    ],
  },
};

export const Loading: Story = {
  args: { invoices: [], invoicesLoading: true, timeLoading: true },
};

export const NoInvoicesNoTime: Story = {
  args: { invoices: [], totalSeconds: 0 },
};

export const NoProjectsLinked: Story = {
  args: { invoices: [], hasProjects: false, totalSeconds: 0 },
};
