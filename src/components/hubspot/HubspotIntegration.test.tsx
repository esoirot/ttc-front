import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const useHubspotStatusMock = vi.fn();
vi.mock("@/hooks/integrations/useHubspot", () => ({
  useHubspotStatus: () => useHubspotStatusMock(),
}));
vi.mock("./views/ConnectedView", () => ({
  ConnectedView: () => <div>Connected view</div>,
}));
vi.mock("./views/SetupView", () => ({
  SetupView: () => <div>Setup view</div>,
}));

import { HubspotIntegration } from "./HubspotIntegration";

describe("HubspotIntegration", () => {
  it("shows a loading skeleton while status is loading", () => {
    useHubspotStatusMock.mockReturnValue({ data: undefined, isLoading: true });
    const { container } = render(<HubspotIntegration />);
    expect(screen.queryByText("HubSpot")).not.toBeInTheDocument();
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBe(2);
  });

  it("shows SetupView when not connected", () => {
    useHubspotStatusMock.mockReturnValue({
      data: { connected: false, portalId: null },
      isLoading: false,
    });
    render(<HubspotIntegration />);
    expect(screen.getByText("HubSpot")).toBeInTheDocument();
    expect(screen.getByText("Setup view")).toBeInTheDocument();
  });

  it("shows ConnectedView when connected", () => {
    useHubspotStatusMock.mockReturnValue({
      data: { connected: true, portalId: "123" },
      isLoading: false,
    });
    render(<HubspotIntegration />);
    expect(screen.getByText("Connected view")).toBeInTheDocument();
  });
});
