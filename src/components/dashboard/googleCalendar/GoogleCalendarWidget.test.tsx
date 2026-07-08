import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

const useGoogleCalendarStatusMock = vi.fn();
const useGoogleCalendarEventsMock = vi.fn();
vi.mock("@/hooks/integrations/useGoogleCalendar", () => ({
  useGoogleCalendarStatus: () => useGoogleCalendarStatusMock(),
  useGoogleCalendarEvents: (...args: unknown[]) =>
    useGoogleCalendarEventsMock(...args),
}));

vi.mock("./MiniMonthGrid", () => ({
  MiniMonthGrid: () => <div>Mini month grid</div>,
}));
vi.mock("./AgendaList", () => ({
  AgendaList: () => <div>Agenda list</div>,
}));
vi.mock("./CreateEventDialog", () => ({
  CreateEventDialog: () => <div>Create event dialog</div>,
}));

import { GoogleCalendarWidget } from "./GoogleCalendarWidget";

function renderWidget() {
  return render(
    <MemoryRouter>
      <GoogleCalendarWidget />
    </MemoryRouter>,
  );
}

describe("GoogleCalendarWidget", () => {
  it("shows a loading skeleton while status is loading", () => {
    useGoogleCalendarStatusMock.mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    useGoogleCalendarEventsMock.mockReturnValue({
      data: undefined,
      isLoading: false,
    });
    renderWidget();
    expect(screen.queryByText("Calendar")).not.toBeInTheDocument();
  });

  it("shows a connect prompt linking to settings when not connected", () => {
    useGoogleCalendarStatusMock.mockReturnValue({
      data: { connected: false, email: null },
      isLoading: false,
    });
    useGoogleCalendarEventsMock.mockReturnValue({
      data: undefined,
      isLoading: false,
    });
    renderWidget();
    expect(screen.getByText("Calendar")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Connect" })).toHaveAttribute(
      "href",
      "/google-calendar",
    );
    expect(screen.queryByText("Mini month grid")).not.toBeInTheDocument();
  });

  it("renders the grid, agenda, and create-event dialog when connected", () => {
    useGoogleCalendarStatusMock.mockReturnValue({
      data: { connected: true, email: "u@gmail.com" },
      isLoading: false,
    });
    useGoogleCalendarEventsMock.mockReturnValue({
      data: { items: [] },
      isLoading: false,
    });
    renderWidget();
    expect(screen.getByText("Mini month grid")).toBeInTheDocument();
    expect(screen.getByText("Agenda list")).toBeInTheDocument();
    expect(screen.getByText("Create event dialog")).toBeInTheDocument();
  });
});
