import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatCard } from "./StatCard";

const meta: Meta<typeof StatCard> = {
  component: StatCard,
  title: "Molecules/StatCard",
  args: {
    label: "Active Clients",
    value: 128,
    loading: false,
  },
};
export default meta;
type Story = StoryObj<typeof StatCard>;

export const Default: Story = {};

export const StringValue: Story = {
  args: {
    label: "Revenue (MTD)",
    value: "€12,480",
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};
