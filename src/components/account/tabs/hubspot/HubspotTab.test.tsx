import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

function renderTab(queryClient = createQueryClient()) {
  return render(
    <QueryClientProvider client={queryClient}>
      <HubspotTab />
    </QueryClientProvider>,
  );
}

describe("HubspotTab", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    apiGet.mockReset();
    apiPost.mockReset();
    apiPatch.mockReset();
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

    expect(window.location.href).toBe("http://localhost:3000/hubspot/auth");
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
});
