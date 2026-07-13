import type { Meta, StoryObj } from "@storybook/react-vite";
import { AdminPageHeader } from "./AdminPageHeader";

const meta: Meta<typeof AdminPageHeader> = {
  component: AdminPageHeader,
  title: "Molecules/AdminPageHeader",
  args: {
    title: "Clients",
    total: 42,
  },
};
export default meta;
type Story = StoryObj<typeof AdminPageHeader>;

export const Default: Story = {};

export const ZeroTotal: Story = {
  args: {
    title: "Invoices",
    total: 0,
  },
};

export const LongTitle: Story = {
  args: {
    title: "Company Contacts & Client Relationships",
    total: 1284,
  },
};
