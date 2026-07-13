import type { Meta, StoryObj } from "@storybook/react-vite";
import { BulkDeleteBar } from "./BulkDeleteBar";

const meta: Meta<typeof BulkDeleteBar> = {
  component: BulkDeleteBar,
  title: "Molecules/BulkDeleteBar",
  args: {
    selectedIds: new Set([1, 2, 3]),
    itemLabel: "clients",
    onDelete: async () => {},
    onDone: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof BulkDeleteBar>;

export const Default: Story = {};

export const SingleSelected: Story = {
  args: {
    selectedIds: new Set([1]),
    itemLabel: "client",
  },
};

export const StringIds: Story = {
  args: {
    selectedIds: new Set(["client-1", "client-2"]),
    itemLabel: "clients",
  },
};
