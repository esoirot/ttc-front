import type { Meta, StoryObj } from "@storybook/react-vite";
import { InvoicesPageHeader } from "./InvoicesPageHeader";

const meta: Meta<typeof InvoicesPageHeader> = {
  component: InvoicesPageHeader,
  title: "Molecules/InvoicesPageHeader",
  args: {
    onToggleCreate: () => {},
    onToggleGenerate: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof InvoicesPageHeader>;

export const Default: Story = {};
