import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  ClockifyProject,
  ClockifyTimeEntry,
  ClockifyWorkspace,
  UpdateEntryInput,
} from "@/types/clockify.types";

const useClockifyWorkspacesMock = vi.fn();
const useClockifyProjectsMock = vi.fn();
const useClockifyEntriesMock = vi.fn();
const useClockifyTagsMock = vi.fn();
const useDeleteEntryMock = vi.fn();
const useStartEntryMock = vi.fn();
const useUpdateEntryMock = vi.fn();

vi.mock("@/hooks/integrations/useClockify", () => ({
  useClockifyWorkspaces: () => useClockifyWorkspacesMock(),
  useClockifyProjects: () => useClockifyProjectsMock(),
  useClockifyEntries: (...args: unknown[]) => useClockifyEntriesMock(...args),
  useClockifyTags: () => useClockifyTagsMock(),
  useDeleteEntry: () => useDeleteEntryMock(),
  useStartEntry: () => useStartEntryMock(),
  useUpdateEntry: () => useUpdateEntryMock(),
}));

vi.mock("../ActiveTimer", () => ({
  ActiveTimer: ({
    billabilityLocked,
    recentDescriptions,
  }: {
    billabilityLocked: boolean;
    recentDescriptions: string[];
  }) => (
    <div data-testid="active-timer">
      locked:{String(billabilityLocked)} recent:{recentDescriptions.join(",")}
    </div>
  ),
}));

vi.mock("../groups/DayGroup", () => ({
  DayGroup: ({
    dayKey,
    entries,
    onDelete,
    onResume,
    onUpdate,
  }: {
    dayKey: string;
    entries: ClockifyTimeEntry[];
    onDelete: (id: string) => void;
    onResume: (entry: ClockifyTimeEntry) => void;
    onUpdate: (input: UpdateEntryInput) => void;
  }) => (
    <div data-testid={`day-group-${dayKey}`}>
      {entries.length} entries
      <button onClick={() => onDelete(entries[0]!.id)}>delete-first</button>
      <button onClick={() => onResume(entries[0]!)}>resume-first</button>
      <button
        onClick={() =>
          onUpdate({
            entryId: entries[0]!.id,
            start: entries[0]!.timeInterval.start,
            billable: true,
            tagIds: [],
          })
        }
      >
        update-first
      </button>
    </div>
  ),
}));

import { TrackerView } from "./TrackerView";

function makeEntry(
  overrides: Partial<ClockifyTimeEntry> = {},
): ClockifyTimeEntry {
  return {
    id: "e1",
    description: "Translate",
    projectId: null,
    tagIds: [],
    timeInterval: {
      start: "2026-06-24T09:00:00.000Z",
      end: "2026-06-24T10:00:00.000Z",
      duration: null,
    },
    workspaceId: "ws-1",
    billable: false,
    ...overrides,
  };
}

function makeProject(
  overrides: Partial<ClockifyProject> = {},
): ClockifyProject {
  return {
    id: "p1",
    name: "Docs",
    color: "#000",
    archived: false,
    clientId: null,
    ...overrides,
  };
}

function makeWorkspace(
  overrides: Partial<ClockifyWorkspace> = {},
): ClockifyWorkspace {
  return {
    id: "ws-1",
    name: "My workspace",
    imageUrl: "",
    featureSubscriptionType: null,
    ...overrides,
  };
}

function defaultMocks() {
  useClockifyWorkspacesMock.mockReturnValue({ data: [makeWorkspace()] });
  useClockifyProjectsMock.mockReturnValue({ data: [] });
  useClockifyEntriesMock.mockReturnValue({ data: [] });
  useClockifyTagsMock.mockReturnValue({ data: [] });
  useDeleteEntryMock.mockReturnValue({ mutate: vi.fn() });
  useStartEntryMock.mockReturnValue({ mutate: vi.fn() });
  useUpdateEntryMock.mockReturnValue({ mutate: vi.fn() });
}

describe("TrackerView", () => {
  beforeEach(() => {
    useClockifyWorkspacesMock.mockReset();
    useClockifyProjectsMock.mockReset();
    useClockifyEntriesMock.mockReset();
    useClockifyTagsMock.mockReset();
    useDeleteEntryMock.mockReset();
    useStartEntryMock.mockReset();
    useUpdateEntryMock.mockReset();
    defaultMocks();
  });

  it("renders date range inputs and the ActiveTimer", () => {
    render(<TrackerView workspaceId="ws-1" />);
    expect(screen.getByText("From:")).toBeInTheDocument();
    expect(screen.getByText("To:")).toBeInTheDocument();
    expect(screen.getByTestId("active-timer")).toBeInTheDocument();
  });

  it("shows 'No entries yet.' when there are no completed entries", () => {
    render(<TrackerView workspaceId="ws-1" />);
    expect(screen.getByText("No entries yet.")).toBeInTheDocument();
  });

  it("does not render the project filter row when there are no projects", () => {
    render(<TrackerView workspaceId="ws-1" />);
    expect(screen.queryByText("Project:")).not.toBeInTheDocument();
  });

  it("renders a project filter button per project and an All button", () => {
    useClockifyProjectsMock.mockReturnValue({
      data: [
        makeProject({ id: "p1", name: "Docs" }),
        makeProject({ id: "p2", name: "Contracts" }),
      ],
    });
    render(<TrackerView workspaceId="ws-1" />);
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Docs" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Contracts" }),
    ).toBeInTheDocument();
  });

  it("filters visible entries by the selected project", () => {
    useClockifyProjectsMock.mockReturnValue({
      data: [
        makeProject({ id: "p1", name: "Docs" }),
        makeProject({ id: "p2", name: "Contracts" }),
      ],
    });
    useClockifyEntriesMock.mockReturnValue({
      data: [
        makeEntry({ id: "e1", projectId: "p1" }),
        makeEntry({ id: "e2", projectId: "p2" }),
      ],
    });
    render(<TrackerView workspaceId="ws-1" />);
    fireEvent.click(screen.getByRole("button", { name: "Docs" }));
    const groups = screen.getAllByTestId(/^day-group-/);
    expect(groups).toHaveLength(1);
    expect(groups[0]).toHaveTextContent("1 entries");
  });

  it("shows all completed entries again when All is clicked after filtering", () => {
    useClockifyProjectsMock.mockReturnValue({
      data: [makeProject({ id: "p1", name: "Docs" })],
    });
    useClockifyEntriesMock.mockReturnValue({
      data: [
        makeEntry({ id: "e1", projectId: "p1" }),
        makeEntry({ id: "e2", projectId: null }),
      ],
    });
    render(<TrackerView workspaceId="ws-1" />);
    fireEvent.click(screen.getByRole("button", { name: "Docs" }));
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    const groups = screen.getAllByTestId(/^day-group-/);
    expect(groups[0]).toHaveTextContent("2 entries");
  });

  it("excludes running (no end time) entries from the visible list", () => {
    useClockifyEntriesMock.mockReturnValue({
      data: [
        makeEntry({ id: "e1" }),
        makeEntry({
          id: "e2",
          timeInterval: {
            start: "2026-06-24T09:00:00.000Z",
            end: null,
            duration: null,
          },
        }),
      ],
    });
    render(<TrackerView workspaceId="ws-1" />);
    const groups = screen.getAllByTestId(/^day-group-/);
    expect(groups[0]).toHaveTextContent("1 entries");
  });

  it("passes deduped, non-empty recent descriptions from entries to ActiveTimer", () => {
    useClockifyEntriesMock.mockReturnValue({
      data: [
        makeEntry({ id: "e1", description: "Translate" }),
        makeEntry({ id: "e2", description: "Translate" }),
        makeEntry({ id: "e3", description: "  " }),
        makeEntry({ id: "e4", description: null }),
        makeEntry({ id: "e5", description: "Review" }),
      ],
    });
    render(<TrackerView workspaceId="ws-1" />);
    expect(screen.getByTestId("active-timer")).toHaveTextContent(
      "recent:Translate,Review",
    );
  });

  it("marks billability locked when the workspace has no paid plan", () => {
    render(<TrackerView workspaceId="ws-1" />);
    expect(screen.getByTestId("active-timer")).toHaveTextContent("locked:true");
  });

  it("marks billability unlocked when the workspace has a paid plan", () => {
    useClockifyWorkspacesMock.mockReturnValue({
      data: [makeWorkspace({ featureSubscriptionType: "PRO" })],
    });
    render(<TrackerView workspaceId="ws-1" />);
    expect(screen.getByTestId("active-timer")).toHaveTextContent(
      "locked:false",
    );
  });

  it("calls deleteEntry, startEntry, and updateEntry via DayGroup callbacks", () => {
    const deleteEntry = vi.fn();
    const startEntry = vi.fn();
    const updateEntry = vi.fn();
    useDeleteEntryMock.mockReturnValue({ mutate: deleteEntry });
    useStartEntryMock.mockReturnValue({ mutate: startEntry });
    useUpdateEntryMock.mockReturnValue({ mutate: updateEntry });
    useClockifyEntriesMock.mockReturnValue({
      data: [makeEntry({ id: "e1", description: "Translate", billable: true })],
    });
    render(<TrackerView workspaceId="ws-1" />);

    fireEvent.click(screen.getByText("delete-first"));
    expect(deleteEntry).toHaveBeenCalledWith("e1");

    fireEvent.click(screen.getByText("resume-first"));
    expect(startEntry).toHaveBeenCalledWith(
      expect.objectContaining({ description: "Translate", billable: true }),
    );

    fireEvent.click(screen.getByText("update-first"));
    expect(updateEntry).toHaveBeenCalledWith(
      expect.objectContaining({ entryId: "e1" }),
    );
  });

  it("changes the start date input", () => {
    render(<TrackerView workspaceId="ws-1" />);
    const [fromInput] = screen.getAllByDisplayValue(/\d{4}-\d{2}-\d{2}/);
    fireEvent.change(fromInput, { target: { value: "2026-01-01" } });
    expect(fromInput).toHaveValue("2026-01-01");
  });

  it("changes the end date input", () => {
    render(<TrackerView workspaceId="ws-1" />);
    const inputs = screen.getAllByDisplayValue(/\d{4}-\d{2}-\d{2}/);
    const toInput = inputs[1]!;
    fireEvent.change(toInput, { target: { value: "2026-06-01" } });
    expect(toInput).toHaveValue("2026-06-01");
  });

  it("ignores an empty value change on the date inputs", () => {
    render(<TrackerView workspaceId="ws-1" />);
    const [fromInput] = screen.getAllByDisplayValue(/\d{4}-\d{2}-\d{2}/);
    const before = (fromInput as HTMLInputElement).value;
    fireEvent.change(fromInput, { target: { value: "" } });
    expect(fromInput).toHaveValue(before);
  });
});
