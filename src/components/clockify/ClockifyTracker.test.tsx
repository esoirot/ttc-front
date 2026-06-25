import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ClockifyWorkspace } from "@/types/clockify.types";

const useClockifyStatusMock = vi.fn();
const useClockifyWorkspacesMock = vi.fn();
vi.mock("@/hooks/integrations/useClockify", () => ({
  useClockifyStatus: () => useClockifyStatusMock(),
  useClockifyWorkspaces: () => useClockifyWorkspacesMock(),
}));

vi.mock("./forms/ConnectForm", () => ({
  ConnectForm: () => <div data-testid="connect-form" />,
}));

vi.mock("./views/TrackerView", () => ({
  TrackerView: ({ workspaceId }: { workspaceId: string }) => (
    <div data-testid="tracker-view" data-workspace={workspaceId} />
  ),
}));

vi.mock("./forms-inputs/WorkspacePicker", () => ({
  WorkspacePicker: () => <div data-testid="workspace-picker" />,
}));

import { ClockifyTracker } from "./ClockifyTracker";

function makeWorkspace(
  overrides: Partial<ClockifyWorkspace> = {},
): ClockifyWorkspace {
  return {
    id: "ws-1",
    name: "Personal",
    imageUrl: "",
    featureSubscriptionType: null,
    ...overrides,
  };
}

describe("ClockifyTracker", () => {
  beforeEach(() => {
    useClockifyStatusMock.mockReset();
    useClockifyWorkspacesMock.mockReset();
    useClockifyWorkspacesMock.mockReturnValue({ data: [] });
  });

  it("shows loading skeleton and no heading while loading", () => {
    useClockifyStatusMock.mockReturnValue({ data: undefined, isLoading: true });
    render(<ClockifyTracker />);
    expect(screen.queryByText("Time Tracker")).not.toBeInTheDocument();
    expect(screen.queryByTestId("connect-form")).not.toBeInTheDocument();
  });

  it("shows the Time Tracker heading when loaded", () => {
    useClockifyStatusMock.mockReturnValue({
      data: { connected: false, workspaceId: null },
      isLoading: false,
    });
    render(<ClockifyTracker />);
    expect(
      screen.getByRole("heading", { name: "Time Tracker" }),
    ).toBeInTheDocument();
  });

  it("shows ConnectForm when not connected", () => {
    useClockifyStatusMock.mockReturnValue({
      data: { connected: false, workspaceId: null },
      isLoading: false,
    });
    render(<ClockifyTracker />);
    expect(screen.getByTestId("connect-form")).toBeInTheDocument();
    expect(screen.queryByTestId("workspace-picker")).not.toBeInTheDocument();
    expect(screen.queryByTestId("tracker-view")).not.toBeInTheDocument();
  });

  it("shows WorkspacePicker when connected but no workspaceId", () => {
    useClockifyStatusMock.mockReturnValue({
      data: { connected: true, workspaceId: null },
      isLoading: false,
    });
    render(<ClockifyTracker />);
    expect(screen.getByTestId("workspace-picker")).toBeInTheDocument();
    expect(screen.queryByTestId("connect-form")).not.toBeInTheDocument();
    expect(screen.queryByTestId("tracker-view")).not.toBeInTheDocument();
  });

  it("shows TrackerView with the workspaceId when fully connected", () => {
    useClockifyStatusMock.mockReturnValue({
      data: { connected: true, workspaceId: "ws-42" },
      isLoading: false,
    });
    render(<ClockifyTracker />);
    const view = screen.getByTestId("tracker-view");
    expect(view).toBeInTheDocument();
    expect(view).toHaveAttribute("data-workspace", "ws-42");
    expect(screen.queryByTestId("connect-form")).not.toBeInTheDocument();
    expect(screen.queryByTestId("workspace-picker")).not.toBeInTheDocument();
  });

  it("shows the plan badge when the active workspace has a subscription type", () => {
    useClockifyStatusMock.mockReturnValue({
      data: { connected: true, workspaceId: "ws-1" },
      isLoading: false,
    });
    useClockifyWorkspacesMock.mockReturnValue({
      data: [makeWorkspace({ id: "ws-1", featureSubscriptionType: "PRO" })],
    });
    render(<ClockifyTracker />);
    expect(screen.getByText("PRO")).toBeInTheDocument();
  });

  it("hides the plan badge when featureSubscriptionType is null", () => {
    useClockifyStatusMock.mockReturnValue({
      data: { connected: true, workspaceId: "ws-1" },
      isLoading: false,
    });
    useClockifyWorkspacesMock.mockReturnValue({
      data: [makeWorkspace({ id: "ws-1", featureSubscriptionType: null })],
    });
    render(<ClockifyTracker />);
    expect(screen.queryByText("PRO")).not.toBeInTheDocument();
    expect(screen.queryByText("FREE")).not.toBeInTheDocument();
  });

  it("shows connection prompt text when not connected", () => {
    useClockifyStatusMock.mockReturnValue({
      data: { connected: false, workspaceId: null },
      isLoading: false,
    });
    render(<ClockifyTracker />);
    expect(
      screen.getByText("Connect your Clockify account to start tracking time."),
    ).toBeInTheDocument();
  });

  it("shows workspace prompt text when connected but no workspace", () => {
    useClockifyStatusMock.mockReturnValue({
      data: { connected: true, workspaceId: null },
      isLoading: false,
    });
    render(<ClockifyTracker />);
    expect(
      screen.getByText("Choose a workspace to track time in."),
    ).toBeInTheDocument();
  });
});
