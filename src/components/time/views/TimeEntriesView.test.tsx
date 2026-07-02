import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useTimeEntriesPageMock = vi.fn();
vi.mock("@/hooks/time/useTimeEntriesPage", () => ({
  useTimeEntriesPage: () => useTimeEntriesPageMock(),
}));

let headerProps: Record<string, unknown> = {};
vi.mock("../headers/TimePageHeader", () => ({
  TimePageHeader: (props: Record<string, unknown>) => {
    headerProps = props;
    return <div data-testid="header" data-props={JSON.stringify(props)} />;
  },
}));
vi.mock("../forms/ClockifyImportForm", () => ({
  ClockifyImportForm: () => <div data-testid="import-form" />,
}));
vi.mock("../sections/TimerSection", () => ({
  TimerSection: () => <div data-testid="timer-section" />,
}));
vi.mock("../forms/ManualEntryForm", () => ({
  ManualEntryForm: () => <div data-testid="manual-form" />,
}));
vi.mock("../filters/DateRangeFilter", () => ({
  DateRangeFilter: () => <div data-testid="date-filter" />,
}));

let entryListProps: Record<string, unknown> = {};
vi.mock("../lists/EntryList", () => ({
  EntryList: (props: Record<string, unknown>) => {
    entryListProps = props;
    return <div data-testid="entry-list" />;
  },
}));

import { TimeEntriesView } from "./TimeEntriesView";

function basePageState(overrides: Record<string, unknown> = {}) {
  return {
    startDate: "2026-06-01",
    setStartDate: vi.fn(),
    endDate: "2026-06-30",
    setEndDate: vi.fn(),
    entries: [],
    loading: false,
    hasMore: false,
    loadMore: vi.fn(),
    total: 0,
    refetch: vi.fn(),
    activeTimer: null,
    stopTimer: vi.fn(),
    stopping: false,
    deleteTimeEntry: vi.fn(),
    updateTimeEntry: vi.fn(),
    resumeTimeEntry: vi.fn(),
    projects: [],
    tags: [],
    workspaceId: null,
    showManual: false,
    setShowManual: vi.fn(),
    showImport: false,
    setShowImport: vi.fn(),
    totalSeconds: 0,
    recentDescriptions: [],
    ...overrides,
  };
}

describe("TimeEntriesView", () => {
  beforeEach(() => {
    useTimeEntriesPageMock.mockReset();
    entryListProps = {};
    headerProps = {};
  });

  it("always renders header, timer section, date filter, and entry list", () => {
    useTimeEntriesPageMock.mockReturnValue(basePageState());
    render(<TimeEntriesView />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("timer-section")).toBeInTheDocument();
    expect(screen.getByTestId("date-filter")).toBeInTheDocument();
    expect(screen.getByTestId("entry-list")).toBeInTheDocument();
  });

  it("hides ClockifyImportForm when showImport is false", () => {
    useTimeEntriesPageMock.mockReturnValue(
      basePageState({ showImport: false, workspaceId: "ws-1" }),
    );
    render(<TimeEntriesView />);

    expect(screen.queryByTestId("import-form")).not.toBeInTheDocument();
  });

  it("hides ClockifyImportForm when there is no workspace, even if showImport is true", () => {
    useTimeEntriesPageMock.mockReturnValue(
      basePageState({ showImport: true, workspaceId: null }),
    );
    render(<TimeEntriesView />);

    expect(screen.queryByTestId("import-form")).not.toBeInTheDocument();
  });

  it("shows ClockifyImportForm when showImport is true and a workspace is connected", () => {
    useTimeEntriesPageMock.mockReturnValue(
      basePageState({ showImport: true, workspaceId: "ws-1" }),
    );
    render(<TimeEntriesView />);

    expect(screen.getByTestId("import-form")).toBeInTheDocument();
  });

  it("shows ManualEntryForm only when showManual is true", () => {
    useTimeEntriesPageMock.mockReturnValue(
      basePageState({ showManual: false }),
    );
    const { rerender } = render(<TimeEntriesView />);
    expect(screen.queryByTestId("manual-form")).not.toBeInTheDocument();

    useTimeEntriesPageMock.mockReturnValue(basePageState({ showManual: true }));
    rerender(<TimeEntriesView />);
    expect(screen.getByTestId("manual-form")).toBeInTheDocument();
  });

  it("wires onResume to resumeTimeEntry with the entry id", () => {
    const resumeTimeEntry = vi.fn();
    useTimeEntriesPageMock.mockReturnValue(basePageState({ resumeTimeEntry }));
    render(<TimeEntriesView />);

    const onResume = entryListProps.onResume as (entry: unknown) => void;
    onResume({
      id: 7,
      description: "Translate",
      projectId: 3,
      billable: true,
      tags: [{ id: 1, name: "Urgent" }],
    });

    expect(resumeTimeEntry).toHaveBeenCalledWith(7);
  });

  it("wires onUpdate to updateTimeEntry", () => {
    const updateTimeEntry = vi.fn();
    useTimeEntriesPageMock.mockReturnValue(basePageState({ updateTimeEntry }));
    render(<TimeEntriesView />);

    const onUpdate = entryListProps.onUpdate as (input: unknown) => void;
    onUpdate({ id: 5, description: "New" });

    expect(updateTimeEntry).toHaveBeenCalledWith({
      id: 5,
      description: "New",
    });
  });

  it("passes workspaceId, showManual, and showImport to the page header", () => {
    useTimeEntriesPageMock.mockReturnValue(
      basePageState({
        workspaceId: "ws-99",
        showManual: true,
        showImport: false,
      }),
    );
    render(<TimeEntriesView />);

    const serialized = JSON.parse(
      screen.getByTestId("header").getAttribute("data-props") ?? "{}",
    ) as Record<string, unknown>;
    expect(serialized.workspaceId).toBe("ws-99");
    expect(serialized.showManual).toBe(true);
    expect(serialized.showImport).toBe(false);
  });

  it("header onToggleManual calls setShowManual with an updater function", () => {
    const setShowManual = vi.fn();
    useTimeEntriesPageMock.mockReturnValue(
      basePageState({ setShowManual, showManual: false }),
    );
    render(<TimeEntriesView />);

    act(() => (headerProps.onToggleManual as () => void)());

    expect(setShowManual).toHaveBeenCalledWith(expect.any(Function));
  });

  it("header onToggleImport calls setShowImport with an updater function", () => {
    const setShowImport = vi.fn();
    useTimeEntriesPageMock.mockReturnValue(
      basePageState({ setShowImport, showImport: false }),
    );
    render(<TimeEntriesView />);

    act(() => (headerProps.onToggleImport as () => void)());

    expect(setShowImport).toHaveBeenCalledWith(expect.any(Function));
  });

  it("passes entries, loading, hasMore, and loadMore to EntryList", () => {
    const loadMore = vi.fn();
    const entries = [{ id: 1 }, { id: 2 }] as unknown[];
    useTimeEntriesPageMock.mockReturnValue(
      basePageState({ entries, loading: true, hasMore: true, loadMore }),
    );
    render(<TimeEntriesView />);

    expect(entryListProps.entries).toBe(entries);
    expect(entryListProps.loading).toBe(true);
    expect(entryListProps.hasMore).toBe(true);
    expect(entryListProps.loadMore).toBe(loadMore);
  });

  it("passes projects and tags to EntryList", () => {
    const projects = [{ id: 1, title: "P" }] as unknown[];
    const tags = [{ id: 2, name: "Urgent" }] as unknown[];
    useTimeEntriesPageMock.mockReturnValue(basePageState({ projects, tags }));
    render(<TimeEntriesView />);

    expect(entryListProps.projects).toBe(projects);
    expect(entryListProps.tags).toBe(tags);
  });
});
