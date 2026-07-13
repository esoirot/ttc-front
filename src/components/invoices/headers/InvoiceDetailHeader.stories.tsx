import type { Meta, StoryObj } from "@storybook/react-vite";
import { InvoiceDetailHeader } from "./InvoiceDetailHeader";

const meta: Meta<typeof InvoiceDetailHeader> = {
  component: InvoiceDetailHeader,
  title: "Organisms/InvoiceDetailHeader",
  args: {
    number: "INV-0001",
    status: "DRAFT",
    dueDate: "2026-06-15T00:00:00.000Z",
    logoUrl: null,
    downloading: false,
    onStatusChange: () => {},
    onDownloadPdf: () => {},
    onDelete: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof InvoiceDetailHeader>;

export const Default: Story = {};

export const Sent: Story = {
  args: { status: "SENT" },
};

export const Paid: Story = {
  args: { status: "PAID", dueDate: null },
};

export const Overdue: Story = {
  args: { status: "OVERDUE" },
};

export const Downloading: Story = {
  args: { downloading: true },
};

export const WithLogo: Story = {
  args: { logoUrl: "https://example.com/logo.png" },
};
