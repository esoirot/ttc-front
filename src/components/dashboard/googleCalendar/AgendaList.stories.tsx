import type { Meta, StoryObj } from "@storybook/react-vite";
import { AgendaList } from "./AgendaList";
import type { GoogleCalendarEvent } from "@/types/google-calendar.types";

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
    summary: "Team standup",
    start: { dateTime: "2026-07-09T09:00:00Z" },
    end: { dateTime: "2026-07-09T09:30:00Z" },
    htmlLink: "https://calendar.google.com/event2",
  },
];

const meta: Meta<typeof AgendaList> = {
  component: AgendaList,
  title: "Molecules/AgendaList",
  args: {
    selectedDate,
    events,
  },
};
export default meta;
type Story = StoryObj<typeof AgendaList>;

export const Default: Story = {};

export const Empty: Story = { args: { events: [] } };
