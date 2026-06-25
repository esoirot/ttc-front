import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ChangeEvent } from "react";
import type { ClockifyTimeEntry } from "@/types/clockify.types";

const useClockifyActiveEntryMock = vi.fn();
const useStartEntryMock = vi.fn();
const useStopEntryMock = vi.fn();
vi.mock("@/hooks/integrations/useClockify", () => ({
  useClockifyActiveEntry: () => useClockifyActiveEntryMock(),
  useStartEntry: () => useStartEntryMock(),
  useStopEntry: () => useStopEntryMock(),
}));

let capturedOnEnter: (() => void) | undefined;
vi.mock("../time/form-inputs/DescriptionCombobox", () => ({
  DescriptionCombobox: (props: {
    value: string;
    onChange: (val: string) => void;
    onEnter?: () => void;
  }) => {
    capturedOnEnter = props.onEnter;
    return (
      <input
        data-testid="desc-input"
        value={props.value}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          props.onChange(e.target.value)
        }
        placeholder="Description"
      />
    );
  },
}));

vi.mock("./tags/TagChips", () => ({
  TagChips: () => <div data-testid="tag-chips" />,
}));

vi.mock("./forms-inputs/ProjectSelect", () => ({
  ProjectSelect: ({ onChange }: { onChange: (id: string | null) => void }) => (
    <button data-testid="project-select" onClick={() => onChange("p1")}>
      Project
    </button>
  ),
}));

import { ActiveTimer } from "./ActiveTimer";

function makeActive(
  overrides: Partial<ClockifyTimeEntry> = {},
): ClockifyTimeEntry {
  return {
    id: "e1",
    description: "Translate",
    projectId: null,
    tagIds: [],
    timeInterval: {
      start: new Date(Date.now() - 60_000).toISOString(),
      end: null,
      duration: null,
    },
    workspaceId: "ws-1",
    billable: false,
    ...overrides,
  };
}

const baseProps = {
  workspaceId: "ws-1",
  projects: [
    { id: "p1", name: "Docs", color: "#000", archived: false, clientId: null },
  ],
  tags: [{ id: "t1", name: "Urgent", workspaceId: "ws-1", archived: false }],
  billabilityLocked: false,
  recentDescriptions: [],
};

function defaultMutations() {
  useClockifyActiveEntryMock.mockReturnValue({ data: undefined });
  useStartEntryMock.mockReturnValue({ mutate: vi.fn(), isPending: false });
  useStopEntryMock.mockReturnValue({ mutate: vi.fn(), isPending: false });
}

describe("ActiveTimer", () => {
  beforeEach(() => {
    useClockifyActiveEntryMock.mockReset();
    useStartEntryMock.mockReset();
    useStopEntryMock.mockReset();
    capturedOnEnter = undefined;
    defaultMutations();
  });

  it("shows description input and Start button when no active timer", () => {
    render(<ActiveTimer {...baseProps} />);
    expect(screen.getByTestId("desc-input")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start" })).toBeInTheDocument();
  });

  it("shows Stop button and elapsed clock when a timer is running", () => {
    useClockifyActiveEntryMock.mockReturnValue({ data: makeActive() });
    render(<ActiveTimer {...baseProps} />);
    expect(screen.getByRole("button", { name: "Stop" })).toBeInTheDocument();
    expect(screen.getByText(/\d\d:\d\d:\d\d/)).toBeInTheDocument();
  });

  it("shows active entry description in running view", () => {
    useClockifyActiveEntryMock.mockReturnValue({
      data: makeActive({ description: "Review copy" }),
    });
    render(<ActiveTimer {...baseProps} />);
    expect(screen.getByText("Review copy")).toBeInTheDocument();
  });

  it("shows No description when active entry has no description", () => {
    useClockifyActiveEntryMock.mockReturnValue({
      data: makeActive({ description: null }),
    });
    render(<ActiveTimer {...baseProps} />);
    expect(screen.getByText("No description")).toBeInTheDocument();
  });

  it("shows the active project name when projectId matches a project", () => {
    useClockifyActiveEntryMock.mockReturnValue({
      data: makeActive({ projectId: "p1" }),
    });
    render(<ActiveTimer {...baseProps} />);
    expect(screen.getByText("Docs")).toBeInTheDocument();
  });

  it("shows tag badge for each active tag", () => {
    useClockifyActiveEntryMock.mockReturnValue({
      data: makeActive({ tagIds: ["t1"] }),
    });
    render(<ActiveTimer {...baseProps} />);
    expect(screen.getByText("Urgent")).toBeInTheDocument();
  });

  it("shows $ indicator when active entry is billable", () => {
    useClockifyActiveEntryMock.mockReturnValue({
      data: makeActive({ billable: true }),
    });
    render(<ActiveTimer {...baseProps} />);
    expect(screen.getByText("$")).toBeInTheDocument();
  });

  it("calls stop() when Stop button is clicked", () => {
    const stop = vi.fn();
    useClockifyActiveEntryMock.mockReturnValue({ data: makeActive() });
    useStopEntryMock.mockReturnValue({ mutate: stop, isPending: false });
    render(<ActiveTimer {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Stop" }));
    expect(stop).toHaveBeenCalled();
  });

  it("shows Stopping… and disables the Stop button while stopping", () => {
    useClockifyActiveEntryMock.mockReturnValue({ data: makeActive() });
    useStopEntryMock.mockReturnValue({ mutate: vi.fn(), isPending: true });
    render(<ActiveTimer {...baseProps} />);
    expect(screen.getByRole("button", { name: "Stopping…" })).toBeDisabled();
  });

  it("calls start() with description, projectId, tagIds, and billable when Start is clicked", () => {
    const start = vi.fn();
    useStartEntryMock.mockReturnValue({ mutate: start, isPending: false });
    render(<ActiveTimer {...baseProps} />);

    fireEvent.change(screen.getByTestId("desc-input"), {
      target: { value: "  Translate  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    expect(start).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Translate",
        projectId: undefined,
        tagIds: [],
        billable: false,
      }),
    );
  });

  it("clears the description field after Start is clicked", () => {
    const start = vi.fn();
    useStartEntryMock.mockReturnValue({ mutate: start, isPending: false });
    render(<ActiveTimer {...baseProps} />);

    fireEvent.change(screen.getByTestId("desc-input"), {
      target: { value: "Translate" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    expect(screen.getByTestId("desc-input")).toHaveValue("");
  });

  it("shows Starting… and disables Start while the mutation is pending", () => {
    useStartEntryMock.mockReturnValue({ mutate: vi.fn(), isPending: true });
    render(<ActiveTimer {...baseProps} />);
    expect(screen.getByRole("button", { name: "Starting…" })).toBeDisabled();
  });

  it("calls start() via the DescriptionCombobox onEnter callback", () => {
    const start = vi.fn();
    useStartEntryMock.mockReturnValue({ mutate: start, isPending: false });
    render(<ActiveTimer {...baseProps} />);

    act(() => capturedOnEnter?.());

    expect(start).toHaveBeenCalled();
  });

  it("passes a non-null projectId when one is selected", () => {
    const start = vi.fn();
    useStartEntryMock.mockReturnValue({ mutate: start, isPending: false });
    render(<ActiveTimer {...baseProps} />);

    fireEvent.click(screen.getByTestId("project-select")); // triggers onChange("p1")
    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    expect(start).toHaveBeenCalledWith(
      expect.objectContaining({ projectId: "p1" }),
    );
  });
});
