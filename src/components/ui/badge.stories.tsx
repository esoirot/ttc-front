import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
  component: Badge,
  title: "ui/Badge",
  args: { children: "Badge" },
};
export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {};

export const Secondary: Story = { args: { variant: "secondary" } };

export const Destructive: Story = {
  args: { variant: "destructive", children: "Cancelled" },
};

export const Outline: Story = { args: { variant: "outline" } };

export const ProjectStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge
        variant="outline"
        className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30"
      >
        DRAFT
      </Badge>
      <Badge>ACTIVE</Badge>
      <Badge
        variant="outline"
        className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30"
      >
        COMPLETED
      </Badge>
      <Badge variant="destructive">CANCELLED</Badge>
      <Badge
        variant="outline"
        className="bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/30"
      >
        ARCHIVED
      </Badge>
      <Badge
        variant="outline"
        className="bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30"
      >
        INVOICE_SENT
      </Badge>
      <Badge
        variant="outline"
        className="bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30"
      >
        INVOICE_PAID
      </Badge>
    </div>
  ),
};
