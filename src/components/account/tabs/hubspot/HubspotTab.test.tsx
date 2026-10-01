import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { redirectTo } = vi.hoisted(() => ({ redirectTo: vi.fn() }));
vi.mock("@/lib/navigation", () => ({ redirectTo }));
import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/useLocale";

const { apiGet, apiPost, apiPatch, apiDelete } = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPatch: vi.fn(),
  apiDelete: vi.fn(),
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return { ...actual, apiGet, apiPost, apiPatch, apiDelete };
});

import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/test/queryClientWrapper";
import { HubspotTab } from "./HubspotTab";

function renderTab(queryClient = createQueryClient(), locale: Locale = "en") {
  return render(
    <IntlProvider locale={locale} messages={messages[locale]}>
      <QueryClientProvider client={queryClient}>
        <HubspotTab />
      </QueryClientProvider>
    </IntlProvider>,
  );
}

describe("HubspotTab", () => {
  beforeEach(() => {
    apiGet.mockReset();
    apiPost.mockReset();
    apiPatch.mockReset();
    apiDelete.mockReset();
    redirectTo.mockClear();
  });

  it("shows a connect prompt when not connected", async () => {
    apiGet.mockResolvedValueOnce({ connected: false });
    renderTab();

    expect(
      await screen.findByText(
        "Connect your HubSpot account to sync contacts, companies, and deals.",
      ),
    ).toBeInTheDocument();
  });

  it("redirects to the hubspot auth endpoint when Connect is clicked", async () => {
    apiGet.mockResolvedValueOnce({ connected: false });
    renderTab();

    fireEvent.click(await screen.findByText("Connect HubSpot"));

    expect(redirectTo).toHaveBeenCalledWith(
      "http://localhost:3000/hubspot/auth",
    );
  });

  it("shows Connected status with the portal id", async () => {
    apiGet.mockResolvedValueOnce({ connected: true, portalId: "12345" });
    renderTab();

    expect(await screen.findByText("✓ Connected")).toBeInTheDocument();
    expect(screen.getByText("Portal 12345")).toBeInTheDocument();
  });

  it("disconnects hubspot when Disconnect HubSpot is clicked", async () => {
    apiGet.mockResolvedValueOnce({ connected: true, portalId: "12345" });
    apiDelete.mockResolvedValueOnce(undefined);
    // useDisconnectHubspot invalidates ["hubspot"] on success, triggering a
    // refetch of the status query — mock its post-disconnect response too.
    apiGet.mockResolvedValueOnce({ connected: false, portalId: null });
    renderTab();

    fireEvent.click(await screen.findByText("Disconnect HubSpot"));

    await waitFor(() =>
      expect(apiDelete).toHaveBeenCalledWith("/hubspot/disconnect"),
    );
  });

  it("renders French copy when locale is fr", async () => {
    apiGet.mockResolvedValueOnce({ connected: false });
    renderTab(createQueryClient(), "fr");

    expect(
      await screen.findByText(
        "Connectez votre compte HubSpot pour synchroniser contacts, entreprises et transactions.",
      ),
    ).toBeInTheDocument();
  });
});
