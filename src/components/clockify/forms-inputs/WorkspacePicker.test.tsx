import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ClockifyWorkspace } from "@/types/clockify.types";

const useClockifyWorkspacesMock = vi.fn();
const useSetClockifyWorkspaceMock = vi.fn();
vi.mock("@/hooks/integrations/useClockify", () => ({
  useClockifyWorkspaces: () => useClockifyWorkspacesMock(),
  useSetClockifyWorkspace: () => useSetClockifyWorkspaceMock(),
}));

import { WorkspacePicker } from "./WorkspacePicker";

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

describe("WorkspacePicker", () => {
  beforeEach(() => {
    useClockifyWorkspacesMock.mockReset();
    useSetClockifyWorkspaceMock.mockReset();
    useClockifyWorkspacesMock.mockReturnValue({ data: [], isLoading: false });
    useSetClockifyWorkspaceMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
  });

  it("shows a loading message while workspaces are loading", () => {
    useClockifyWorkspacesMock.mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    render(<WorkspacePicker />);
    expect(screen.getByText("Loading workspaces…")).toBeInTheDocument();
  });

  it("renders a button for each workspace when loaded", () => {
    useClockifyWorkspacesMock.mockReturnValue({
      data: [
        makeWorkspace({ id: "ws-1", name: "Personal" }),
        makeWorkspace({ id: "ws-2", name: "Work" }),
      ],
      isLoading: false,
    });
    render(<WorkspacePicker />);
    expect(
      screen.getByRole("button", { name: "Personal" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Work" })).toBeInTheDocument();
  });

  it("calls mutate with the workspace id when a button is clicked", () => {
    const mutate = vi.fn();
    useSetClockifyWorkspaceMock.mockReturnValue({ mutate, isPending: false });
    useClockifyWorkspacesMock.mockReturnValue({
      data: [makeWorkspace({ id: "ws-1", name: "Personal" })],
      isLoading: false,
    });
    render(<WorkspacePicker />);
    fireEvent.click(screen.getByRole("button", { name: "Personal" }));
    expect(mutate).toHaveBeenCalledWith("ws-1");
  });

  it("disables all workspace buttons while a selection is pending", () => {
    useSetClockifyWorkspaceMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    });
    useClockifyWorkspacesMock.mockReturnValue({
      data: [
        makeWorkspace({ id: "ws-1", name: "Personal" }),
        makeWorkspace({ id: "ws-2", name: "Work" }),
      ],
      isLoading: false,
    });
    render(<WorkspacePicker />);
    expect(screen.getByRole("button", { name: "Personal" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Work" })).toBeDisabled();
  });

  it("shows the prompt text when not loading", () => {
    render(<WorkspacePicker />);
    expect(
      screen.getByText("Select your default workspace:"),
    ).toBeInTheDocument();
  });
});
