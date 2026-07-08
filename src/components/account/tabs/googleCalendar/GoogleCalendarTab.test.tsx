import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { apiGet, apiPost, apiDelete } = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiDelete: vi.fn(),
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return { ...actual, apiGet, apiPost, apiDelete };
});

import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/test/queryClientWrapper";
import { GoogleCalendarTab } from "./GoogleCalendarTab";

function renderTab(queryClient = createQueryClient()) {
  return render(
    <QueryClientProvider client={queryClient}>
      <GoogleCalendarTab />
    </QueryClientProvider>,
  );
}

describe("GoogleCalendarTab", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    apiGet.mockReset();
    apiPost.mockReset();
    apiDelete.mockReset();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, href: "" },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("shows a connect prompt when not connected", async () => {
    apiGet.mockResolvedValueOnce({ connected: false, email: null });
    renderTab();

    expect(
      await screen.findByText(
        "Connect your Google account to see your events on the dashboard and create new ones.",
      ),
    ).toBeInTheDocument();
  });

  it("redirects to the google-calendar auth endpoint when Connect is clicked", async () => {
    apiGet.mockResolvedValueOnce({ connected: false, email: null });
    renderTab();

    fireEvent.click(await screen.findByText("Connect Google Calendar"));

    expect(window.location.href).toBe(
      "http://localhost:3000/google-calendar/auth",
    );
  });

  it("shows Connected status with the account email", async () => {
    apiGet.mockResolvedValueOnce({ connected: true, email: "u@gmail.com" });
    renderTab();

    expect(await screen.findByText("✓ Connected")).toBeInTheDocument();
    expect(screen.getByText("u@gmail.com")).toBeInTheDocument();
  });

  it("disconnects when Disconnect Google Calendar is clicked", async () => {
    apiGet.mockResolvedValueOnce({ connected: true, email: "u@gmail.com" });
    apiDelete.mockResolvedValueOnce(undefined);
    // useDisconnectGoogleCalendar invalidates ["google-calendar"] on success,
    // triggering a refetch of the status query — mock its post-disconnect
    // response too.
    apiGet.mockResolvedValueOnce({ connected: false, email: null });
    renderTab();

    fireEvent.click(await screen.findByText("Disconnect Google Calendar"));

    await waitFor(() =>
      expect(apiDelete).toHaveBeenCalledWith("/google-calendar/disconnect"),
    );
  });
});
