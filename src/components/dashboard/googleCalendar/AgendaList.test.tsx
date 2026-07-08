import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { GoogleCalendarEvent } from "@/types/google-calendar.types";
import { AgendaList } from "./AgendaList";

function makeEvent(
  overrides: Partial<GoogleCalendarEvent> = {},
): GoogleCalendarEvent {
  return {
    id: "e1",
    summary: "Client call",
    start: { dateTime: "2026-07-10T14:00:00.000Z" },
    end: { dateTime: "2026-07-10T15:00:00.000Z" },
    htmlLink: "https://calendar.google.com/event?eid=e1",
    ...overrides,
  };
}

describe("AgendaList", () => {
  it("shows an empty state when there are no events", () => {
    render(<AgendaList selectedDate={new Date(2026, 6, 10)} events={[]} />);
    expect(screen.getByText("No events")).toBeInTheDocument();
  });

  it("renders event title and links to the Google Calendar event", () => {
    render(
      <AgendaList
        selectedDate={new Date(2026, 6, 10)}
        events={[makeEvent()]}
      />,
    );
    expect(screen.getByText("Client call")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "https://calendar.google.com/event?eid=e1",
    );
  });

  it("shows 'All day' for all-day events", () => {
    render(
      <AgendaList
        selectedDate={new Date(2026, 6, 10)}
        events={[
          makeEvent({ start: { date: "2026-07-10" }, summary: "Offsite" }),
        ]}
      />,
    );
    expect(screen.getByText("All day")).toBeInTheDocument();
  });

  it("falls back to '(no title)' when summary is missing", () => {
    render(
      <AgendaList
        selectedDate={new Date(2026, 6, 10)}
        events={[makeEvent({ summary: undefined })]}
      />,
    );
    expect(screen.getByText("(no title)")).toBeInTheDocument();
  });
});
