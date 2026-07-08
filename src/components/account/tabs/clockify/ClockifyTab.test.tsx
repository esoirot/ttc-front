import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

vi.mock("@/components/clockify/forms/ConnectForm", () => ({
  ConnectForm: () => <div data-testid="connect-form" />,
}));
vi.mock("@/components/clockify/forms-inputs/WorkspacePicker", () => ({
  WorkspacePicker: () => <div data-testid="workspace-picker" />,
}));

import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/test/queryClientWrapper";
import { ClockifyTab } from "./ClockifyTab";

function renderTab(queryClient = createQueryClient()) {
  return render(
    <QueryClientProvider client={queryClient}>
      <ClockifyTab />
    </QueryClientProvider>,
  );
}

describe("ClockifyTab", () => {
  beforeEach(() => {
    apiGet.mockReset();
    apiPost.mockReset();
    apiPatch.mockReset();
    apiDelete.mockReset();
  });

  it("shows the ConnectForm when not connected", async () => {
    apiGet.mockResolvedValueOnce({ connected: false });
    renderTab();

    expect(await screen.findByTestId("connect-form")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Connect your Clockify account to enable time tracking.",
      ),
    ).toBeInTheDocument();
  });

  it("shows Connected status with the workspace id when connected", async () => {
    apiGet.mockResolvedValueOnce({ connected: true, workspaceId: "ws-1" });
    renderTab();

    expect(await screen.findByText("✓ Connected")).toBeInTheDocument();
    expect(screen.getByText("Workspace ws-1")).toBeInTheDocument();
  });

  it("prompts for a workspace via WorkspacePicker when connected without one", async () => {
    apiGet.mockResolvedValueOnce({ connected: true, workspaceId: null });
    renderTab();

    await screen.findByText("✓ Connected");
    expect(
      screen.getByText("Choose a workspace to use for time tracking."),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId("workspace-picker").length).toBeGreaterThan(0);
  });

  it("hides the workspace prompt once a workspace is set", async () => {
    apiGet.mockResolvedValueOnce({ connected: true, workspaceId: "ws-1" });
    renderTab();

    await screen.findByText("✓ Connected");
    expect(
      screen.queryByText("Choose a workspace to use for time tracking."),
    ).not.toBeInTheDocument();
  });

  it("disconnects clockify when the confirm dialog is accepted", async () => {
    apiGet.mockResolvedValueOnce({ connected: true, workspaceId: "ws-1" });
    apiDelete.mockResolvedValueOnce(undefined);
    // useDisconnectClockify invalidates ["clockify"] on success, triggering a
    // refetch of the status query — mock its post-disconnect response too.
    apiGet.mockResolvedValueOnce({ connected: false, workspaceId: null });
    renderTab();

    fireEvent.click(await screen.findByText("Disconnect Clockify"));
    fireEvent.click(screen.getByText("Disconnect"));

    await waitFor(() =>
      expect(apiDelete).toHaveBeenCalledWith("/clockify/credentials"),
    );
  });

  it("does not disconnect when the dialog is cancelled", async () => {
    apiGet.mockResolvedValueOnce({ connected: true, workspaceId: "ws-1" });
    renderTab();

    fireEvent.click(await screen.findByText("Disconnect Clockify"));
    fireEvent.click(screen.getByText("Cancel"));

    expect(apiDelete).not.toHaveBeenCalled();
  });
});
