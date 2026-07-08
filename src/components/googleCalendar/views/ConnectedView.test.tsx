import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/dashboard/googleCalendar/GoogleCalendarWidget", () => ({
  GoogleCalendarWidget: () => <div>Google Calendar widget</div>,
}));

import { ConnectedView } from "./ConnectedView";

describe("ConnectedView", () => {
  it("shows the calendar widget", () => {
    render(<ConnectedView />);
    expect(screen.getByText("Google Calendar widget")).toBeInTheDocument();
  });
});
