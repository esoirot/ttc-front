import type { Meta, StoryObj } from "@storybook/react-vite";
import { TableLoadingSkeleton } from "./AdminTableChrome";

const meta: Meta<typeof TableLoadingSkeleton> = {
  component: TableLoadingSkeleton,
  title: "Molecules/TableLoadingSkeleton",
  args: {
    rows: 3,
  },
};
export default meta;
type Story = StoryObj<typeof TableLoadingSkeleton>;

export const Default: Story = {};

export const SingleRow: Story = {
  args: {
    rows: 1,
  },
};

export const ManyRows: Story = {
  args: {
    rows: 8,
  },
};
