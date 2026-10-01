import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { redirectTo } = vi.hoisted(() => ({ redirectTo: vi.fn() }));
vi.mock("@/lib/navigation", () => ({ redirectTo }));
import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/useLocale";

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

function renderTab(
  queryClient = createQueryClient(),
  locale: Locale = "en",
  localeMessages: Record<string, string> = messages[locale],
) {
  return render(
    <IntlProvider locale={locale} messages={localeMessages} onError={() => {}}>
      <QueryClientProvider client={queryClient}>
        <GoogleCalendarTab />
      </QueryClientProvider>
    </IntlProvider>,
  );
}

describe("GoogleCalendarTab", () => {
  beforeEach(() => {
    apiGet.mockReset();
    apiPost.mockReset();
    apiDelete.mockReset();
    redirectTo.mockClear();
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

    expect(redirectTo).toHaveBeenCalledWith(
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

  it("renders French copy when locale is fr", async () => {
    apiGet.mockResolvedValueOnce({ connected: false, email: null });
    renderTab(createQueryClient(), "fr");

    expect(
      await screen.findByText(
        "Connectez votre compte Google pour voir vos événements sur le tableau de bord et en créer de nouveaux.",
      ),
    ).toBeInTheDocument();
  });

  it("shows a skeleton, not the Connect button, while the status loads", () => {
    apiGet.mockReturnValueOnce(new Promise(() => {}));
    const { container } = renderTab();

    expect(
      container.querySelectorAll('[data-slot="skeleton"]').length,
    ).toBeGreaterThan(0);
    expect(
      screen.queryByText("Connect Google Calendar"),
    ).not.toBeInTheDocument();
  });

  it("falls back to the connect prompt when the status request fails", async () => {
    apiGet.mockRejectedValueOnce(new Error("Network down"));
    renderTab();

    expect(
      await screen.findByText(
        "Connect your Google account to see your events on the dashboard and create new ones.",
      ),
    ).toBeInTheDocument();
  });

  it("shows Disconnecting… and disables the button while disconnecting", async () => {
    apiGet.mockResolvedValueOnce({ connected: true, email: "me@example.com" });
    apiDelete.mockReturnValueOnce(new Promise(() => {}));
    renderTab();

    fireEvent.click(await screen.findByText("Disconnect Google Calendar"));

    const button = await screen.findByRole("button", {
      name: "Disconnecting…",
    });
    expect(button).toBeDisabled();
  });

  it("falls back to its built-in English copy when translations are missing", async () => {
    apiGet.mockResolvedValueOnce({ connected: false });
    renderTab(createQueryClient(), "en", {});

    expect(
      await screen.findByText(
        "Connect your Google account to see your events on the dashboard and create new ones.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Connect Google Calendar")).toBeInTheDocument();
  });

  it("falls back to its built-in English connected copy when translations are missing", async () => {
    apiGet.mockResolvedValueOnce({ connected: true, email: "me@example.com" });
    renderTab(createQueryClient(), "en", {});

    expect(await screen.findByText("✓ Connected")).toBeInTheDocument();
    expect(screen.getByText("Disconnect Google Calendar")).toBeInTheDocument();
  });

  it("shows a dash when connected without an account email", async () => {
    apiGet.mockResolvedValueOnce({ connected: true, email: null });
    renderTab();

    expect(await screen.findByText("✓ Connected")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("falls back to its built-in English Disconnecting… copy when translations are missing", async () => {
    apiGet.mockResolvedValueOnce({ connected: true, email: "me@example.com" });
    apiDelete.mockReturnValueOnce(new Promise(() => {}));
    renderTab(createQueryClient(), "en", {});

    fireEvent.click(await screen.findByText("Disconnect Google Calendar"));

    expect(
      await screen.findByRole("button", { name: "Disconnecting…" }),
    ).toBeDisabled();
  });
});
