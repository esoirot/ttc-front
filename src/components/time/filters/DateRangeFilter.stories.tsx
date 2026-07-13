import type { Meta, StoryObj } from "@storybook/react-vite";
import { DateRangeFilter } from "./DateRangeFilter";

const meta: Meta<typeof DateRangeFilter> = {
  component: DateRangeFilter,
  title: "Molecules/DateRangeFilter",
  args: {
    startDate: "2026-06-01",
    setStartDate: () => {},
    endDate: "2026-06-30",
    setEndDate: () => {},
    count: 5,
    total: 12,
    totalSeconds: 3661,
  },
};
export default meta;
type Story = StoryObj<typeof DateRangeFilter>;

export const Default: Story = {};

export const EmptyResults: Story = {
  args: { count: 0, total: 0, totalSeconds: 0 },
};
