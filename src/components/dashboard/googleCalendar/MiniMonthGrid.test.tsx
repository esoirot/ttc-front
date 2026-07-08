import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { GoogleCalendarEvent } from "@/types/google-calendar.types";
import { MiniMonthGrid } from "./MiniMonthGrid";

function makeEvent(
  overrides: Partial<GoogleCalendarEvent> = {},
): GoogleCalendarEvent {
  return {
    id: "e1",
    summary: "Call",
    start: { dateTime: "2026-07-10T10:00:00.000Z" },
    end: { dateTime: "2026-07-10T11:00:00.000Z" },
    ...overrides,
  };
}

describe("MiniMonthGrid", () => {
  it("renders the visible month label", () => {
    render(
      <MiniMonthGrid
        visibleMonth={new Date(2026, 6, 1)}
        onVisibleMonthChange={vi.fn()}
        selectedDate={new Date(2026, 6, 5)}
        onSelectDate={vi.fn()}
        events={[]}
      />,
    );
    expect(screen.getByText("July 2026")).toBeInTheDocument();
  });

  it("calls onSelectDate when a day is clicked", () => {
    const onSelectDate = vi.fn();
    render(
      <MiniMonthGrid
        visibleMonth={new Date(2026, 6, 1)}
        onVisibleMonthChange={vi.fn()}
        selectedDate={new Date(2026, 6, 5)}
        onSelectDate={onSelectDate}
        events={[]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "15" }));

    expect(onSelectDate).toHaveBeenCalledTimes(1);
    const calledWith = onSelectDate.mock.calls[0][0] as Date;
    expect(calledWith.getDate()).toBe(15);
    expect(calledWith.getMonth()).toBe(6);
  });

  it("calls onVisibleMonthChange with the previous month", () => {
    const onVisibleMonthChange = vi.fn();
    render(
      <MiniMonthGrid
        visibleMonth={new Date(2026, 6, 1)}
        onVisibleMonthChange={onVisibleMonthChange}
        selectedDate={new Date(2026, 6, 5)}
        onSelectDate={vi.fn()}
        events={[]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Previous month" }));

    const calledWith = onVisibleMonthChange.mock.calls[0][0] as Date;
    expect(calledWith.getMonth()).toBe(5);
  });

  it("calls onVisibleMonthChange with the next month", () => {
    const onVisibleMonthChange = vi.fn();
    render(
      <MiniMonthGrid
        visibleMonth={new Date(2026, 6, 1)}
        onVisibleMonthChange={onVisibleMonthChange}
        selectedDate={new Date(2026, 6, 5)}
        onSelectDate={vi.fn()}
        events={[]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Next month" }));

    const calledWith = onVisibleMonthChange.mock.calls[0][0] as Date;
    expect(calledWith.getMonth()).toBe(7);
  });

  it("does not crash when an event has neither date nor dateTime", () => {
    render(
      <MiniMonthGrid
        visibleMonth={new Date(2026, 6, 1)}
        onVisibleMonthChange={vi.fn()}
        selectedDate={new Date(2026, 6, 5)}
        onSelectDate={vi.fn()}
        events={[makeEvent({ start: {} })]}
      />,
    );
    expect(screen.getByText("July 2026")).toBeInTheDocument();
  });
});
