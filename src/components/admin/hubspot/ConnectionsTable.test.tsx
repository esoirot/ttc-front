import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HubspotConnection } from "@/types/hubspot.types";

const useHubspotAdminConnectionsMock = vi.fn();
const useForceDisconnectHubspotMock = vi.fn();
vi.mock("@/hooks/integrations/useHubspot", () => ({
  useHubspotAdminConnections: () => useHubspotAdminConnectionsMock(),
  useForceDisconnectHubspot: () => useForceDisconnectHubspotMock(),
}));

import { ConnectionsTable } from "./ConnectionsTable";

function makeConnection(
  overrides: Partial<HubspotConnection> = {},
): HubspotConnection {
  return {
    userId: 1,
    email: "jane@example.com",
    connected: true,
    portalId: "123",
    expiresAt: "2026-12-31T00:00:00.000Z",
    ...overrides,
  };
}

describe("ConnectionsTable", () => {
  beforeEach(() => {
    useHubspotAdminConnectionsMock.mockReset();
    useForceDisconnectHubspotMock.mockReset();
    useForceDisconnectHubspotMock.mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn().mockResolvedValue(undefined),
    });
  });

  it("shows loading skeletons while loading", () => {
    useHubspotAdminConnectionsMock.mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    render(<ConnectionsTable />);
    expect(screen.queryByText("User")).not.toBeInTheDocument();
  });

  it("shows an empty state when there are no connections", () => {
    useHubspotAdminConnectionsMock.mockReturnValue({
      data: [],
      isLoading: false,
    });
    render(<ConnectionsTable />);
    expect(screen.getByText("No HubSpot connections")).toBeInTheDocument();
  });

  it("renders a row per connection with email, status, portal, and expiry", () => {
    useHubspotAdminConnectionsMock.mockReturnValue({
      data: [makeConnection()],
      isLoading: false,
    });
    render(<ConnectionsTable />);
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("Connected")).toBeInTheDocument();
    expect(screen.getByText("123")).toBeInTheDocument();
  });

  it("shows Disconnected badge and — for portal/expiry when not connected", () => {
    useHubspotAdminConnectionsMock.mockReturnValue({
      data: [
        makeConnection({ connected: false, portalId: null, expiresAt: null }),
      ],
      isLoading: false,
    });
    render(<ConnectionsTable />);
    expect(screen.getByText("Disconnected")).toBeInTheDocument();
    expect(screen.getAllByText("—")).toHaveLength(2);
  });

  it("does not show a Disconnect button for a disconnected row", () => {
    useHubspotAdminConnectionsMock.mockReturnValue({
      data: [makeConnection({ connected: false })],
      isLoading: false,
    });
    render(<ConnectionsTable />);
    expect(
      screen.queryByRole("button", { name: "Disconnect" }),
    ).not.toBeInTheDocument();
  });

  it("calls forceDisconnect.mutateAsync with the userId when Disconnect is clicked", () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined);
    useForceDisconnectHubspotMock.mockReturnValue({
      isPending: false,
      mutateAsync,
    });
    useHubspotAdminConnectionsMock.mockReturnValue({
      data: [makeConnection({ userId: 9 })],
      isLoading: false,
    });
    render(<ConnectionsTable />);
    fireEvent.click(screen.getByRole("button", { name: "Disconnect" }));
    expect(mutateAsync).toHaveBeenCalledWith(9);
  });

  it("disables the Disconnect button while the mutation is pending", () => {
    useForceDisconnectHubspotMock.mockReturnValue({
      isPending: true,
      mutateAsync: vi.fn(),
    });
    useHubspotAdminConnectionsMock.mockReturnValue({
      data: [makeConnection()],
      isLoading: false,
    });
    render(<ConnectionsTable />);
    expect(screen.getByRole("button", { name: "Disconnect" })).toBeDisabled();
  });
});
