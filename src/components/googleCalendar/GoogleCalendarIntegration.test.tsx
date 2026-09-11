import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createIntlWrapper } from "@/test/intlWrapper";

const useGoogleCalendarStatusMock = vi.fn();
vi.mock("@/hooks/integrations/useGoogleCalendar", () => ({
  useGoogleCalendarStatus: () => useGoogleCalendarStatusMock(),
}));

vi.mock("./views/ConnectedView", () => ({
  ConnectedView: () => <div>Connected view</div>,
}));
vi.mock("./views/SetupView", () => ({
  SetupView: () => <div>Setup view</div>,
}));

import { GoogleCalendarIntegration } from "./GoogleCalendarIntegration";

const wrapper = createIntlWrapper();

describe("GoogleCalendarIntegration", () => {
  it("shows the title and SetupView when not connected", () => {
    useGoogleCalendarStatusMock.mockReturnValue({
      data: { connected: false, email: null },
      isLoading: false,
    });
    render(<GoogleCalendarIntegration />, { wrapper });
    expect(screen.getByText("Google Calendar")).toBeInTheDocument();
    expect(screen.getByText("Setup view")).toBeInTheDocument();
  });

  it("shows ConnectedView when connected", () => {
    useGoogleCalendarStatusMock.mockReturnValue({
      data: { connected: true, email: "u@gmail.com" },
      isLoading: false,
    });
    render(<GoogleCalendarIntegration />, { wrapper });
    expect(screen.getByText("Connected view")).toBeInTheDocument();
  });

  it("renders French copy when locale is fr", () => {
    useGoogleCalendarStatusMock.mockReturnValue({
      data: { connected: false, email: null },
      isLoading: false,
    });
    render(<GoogleCalendarIntegration />, {
      wrapper: createIntlWrapper("fr"),
    });
    expect(screen.getByText("Google Agenda")).toBeInTheDocument();
  });
});
