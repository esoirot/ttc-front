import type { Meta, StoryObj } from "@storybook/react-vite";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { MiniMonthGrid } from "./MiniMonthGrid";
import type { GoogleCalendarEvent } from "@/types/google-calendar.types";

const visibleMonth = new Date(2026, 6, 1);
const selectedDate = new Date(2026, 6, 9);

const events: GoogleCalendarEvent[] = [
  {
    id: "1",
    summary: "Client sync",
    start: { dateTime: "2026-07-09T14:00:00Z" },
    end: { dateTime: "2026-07-09T15:00:00Z" },
    htmlLink: "https://calendar.google.com/event1",
  },
  {
    id: "2",
    summary: "Project deadline",
    start: { date: "2026-07-15" },
    end: { date: "2026-07-16" },
    htmlLink: "https://calendar.google.com/event2",
  },
];

const meta: Meta<typeof MiniMonthGrid> = {
  component: MiniMonthGrid,
  title: "Molecules/MiniMonthGrid",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <Story />
      </IntlProvider>
    ),
  ],
  args: {
    visibleMonth,
    selectedDate,
    events,
    onVisibleMonthChange: () => {},
    onSelectDate: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof MiniMonthGrid>;

export const Default: Story = {};

export const NoEvents: Story = { args: { events: [] } };
