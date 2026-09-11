import type { Meta, StoryObj } from "@storybook/react-vite";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { DateRangeFilter } from "./DateRangeFilter";

const meta: Meta<typeof DateRangeFilter> = {
  component: DateRangeFilter,
  title: "Molecules/DateRangeFilter",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <Story />
      </IntlProvider>
    ),
  ],
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
