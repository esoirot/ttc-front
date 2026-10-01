import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { redirectTo } = vi.hoisted(() => ({ redirectTo: vi.fn() }));
vi.mock("@/lib/navigation", () => ({ redirectTo }));
import { GOOGLE_CALENDAR_AUTH_URL } from "@/constants/googleCalendar";
import { createIntlWrapper } from "@/test/intlWrapper";
import { SetupView } from "./SetupView";

const wrapper = createIntlWrapper();

describe("SetupView", () => {
  beforeEach(() => {
    redirectTo.mockClear();
  });

  it("shows the title and connect button", () => {
    render(<SetupView />, { wrapper });
    expect(
      screen.getByRole("heading", { name: "Connect Google Calendar" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Connect Google Calendar" }),
    ).toBeInTheDocument();
  });

  it("sends the user to the Google Calendar auth endpoint on connect", () => {
    render(<SetupView />, { wrapper });
    fireEvent.click(
      screen.getByRole("button", { name: "Connect Google Calendar" }),
    );
    expect(redirectTo).toHaveBeenCalledWith(GOOGLE_CALENDAR_AUTH_URL);
  });

  it("renders French copy when locale is fr", () => {
    render(<SetupView />, { wrapper: createIntlWrapper("fr") });
    expect(
      screen.getByRole("heading", { name: "Connecter Google Agenda" }),
    ).toBeInTheDocument();
  });
});
