import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TimeEntry } from "@/types/time-entries.types";

const useTimeEntriesTabMock = vi.fn();
vi.mock("@/hooks/invoices/useTimeEntriesTab", () => ({
  useTimeEntriesTab: (...args: unknown[]) => useTimeEntriesTabMock(...args),
}));

import { TimeEntriesTab } from "./TimeEntriesTab";

function makeEntry(overrides: Partial<TimeEntry> = {}): TimeEntry {
  return {
    id: 1,
    userId: 1,
    projectId: null,
    description: "Translation work",
    startTime: "2026-06-24T09:00:00.000Z",
    endTime: "2026-06-24T10:00:00.000Z",
    durationSeconds: 3600,
    billable: true,
    clockifyEntryId: null,
    tags: [],
    createdAt: "2026-06-24T09:00:00.000Z",
    updatedAt: "2026-06-24T10:00:00.000Z",
    ...overrides,
  };
}

function defaultState() {
  return {
    rates: [],
    projects: [],
    selectedProjectId: "__all__",
    selectedRateId: "",
    unitPrice: "",
    selectedEntryIds: new Set<number>(),
    billableEntries: [] as TimeEntry[],
    entriesLoading: false,
    hasMore: false,
    loadMore: vi.fn(),
    handleProjectChange: vi.fn(),
    handleRateChange: vi.fn(),
    handleUnitPriceChange: vi.fn(),
    toggleEntry: vi.fn(),
    handleBulkAdd: vi.fn().mockResolvedValue(undefined),
  };
}

function renderTab(
  stateOverrides: Partial<ReturnType<typeof defaultState>> = {},
  alreadyAddedEntryIds = new Set<number>(),
) {
  useTimeEntriesTabMock.mockReturnValue({
    ...defaultState(),
    ...stateOverrides,
  });
  return render(
    <TimeEntriesTab
      invoiceId={1}
      alreadyAddedEntryIds={alreadyAddedEntryIds}
      onAdd={vi.fn()}
      adding={false}
    />,
  );
}

describe("TimeEntriesTab", () => {
  beforeEach(() => {
    useTimeEntriesTabMock.mockReset();
  });

  it("shows Loading… when entriesLoading=true", () => {
    renderTab({ entriesLoading: true });
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("shows No billable entries found when entries are empty", () => {
    renderTab({ billableEntries: [], entriesLoading: false });
    expect(screen.getByText("No billable entries found.")).toBeInTheDocument();
  });

  it("renders an entry row for each billable entry", () => {
    renderTab({
      billableEntries: [
        makeEntry({ id: 1, description: "Work A" }),
        makeEntry({ id: 2, description: "Work B" }),
      ],
    });
    expect(screen.getByText("Work A")).toBeInTheDocument();
    expect(screen.getByText("Work B")).toBeInTheDocument();
  });

  it("shows No description in italic for entries with null description", () => {
    renderTab({ billableEntries: [makeEntry({ description: null })] });
    expect(screen.getByText("No description")).toBeInTheDocument();
  });

  it("shows formatted duration for entries with durationSeconds", () => {
    renderTab({ billableEntries: [makeEntry({ durationSeconds: 3600 })] });
    expect(screen.getByText("01:00:00")).toBeInTheDocument();
  });

  it("shows — when durationSeconds is null", () => {
    renderTab({ billableEntries: [makeEntry({ durationSeconds: null })] });
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("shows start date extracted from startTime", () => {
    renderTab({
      billableEntries: [makeEntry({ startTime: "2026-06-24T09:00:00.000Z" })],
    });
    expect(screen.getByText("2026-06-24")).toBeInTheDocument();
  });

  it("shows added badge for already-added entries", () => {
    renderTab({ billableEntries: [makeEntry({ id: 5 })] }, new Set([5]));
    expect(screen.getByText("added")).toBeInTheDocument();
  });

  it("shows unchecked checkbox for non-added non-selected entries", () => {
    renderTab({ billableEntries: [makeEntry({ id: 1 })] });
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("calls toggleEntry when a non-added entry row is clicked", () => {
    const toggleEntry = vi.fn();
    renderTab({
      billableEntries: [makeEntry({ id: 7, description: "Work" })],
      toggleEntry,
    });
    fireEvent.click(screen.getByText("Work"));
    expect(toggleEntry).toHaveBeenCalledWith(7);
  });

  it("does not call toggleEntry when an already-added entry row is clicked", () => {
    const toggleEntry = vi.fn();
    renderTab(
      {
        billableEntries: [makeEntry({ id: 3, description: "Done" })],
        toggleEntry,
      },
      new Set([3]),
    );
    fireEvent.click(screen.getByText("Done"));
    expect(toggleEntry).not.toHaveBeenCalled();
  });

  it("shows Load more button when hasMore=true and calls loadMore on click", () => {
    const loadMore = vi.fn();
    renderTab({
      billableEntries: [makeEntry()],
      hasMore: true,
      loadMore,
    });
    const btn = screen.getByRole("button", { name: "Load more" });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(loadMore).toHaveBeenCalled();
  });

  it("hides Load more when hasMore=false", () => {
    renderTab({ billableEntries: [makeEntry()], hasMore: false });
    expect(
      screen.queryByRole("button", { name: "Load more" }),
    ).not.toBeInTheDocument();
  });

  it("shows N selected text when entries are selected", () => {
    renderTab({ selectedEntryIds: new Set([1, 2]) });
    expect(screen.getByText("2 selected")).toBeInTheDocument();
  });

  it("shows no selected count text when none selected", () => {
    renderTab({ selectedEntryIds: new Set() });
    expect(screen.queryByText(/selected/)).not.toBeInTheDocument();
  });

  it("Add button is disabled when no entries are selected", () => {
    renderTab({ selectedEntryIds: new Set(), unitPrice: "10" });
    expect(screen.getByRole("button", { name: "Add items" })).toBeDisabled();
  });

  it("Add button is disabled when unitPrice is empty even if entries selected", () => {
    renderTab({ selectedEntryIds: new Set([1]), unitPrice: "" });
    expect(screen.getByRole("button", { name: "Add 1 item" })).toBeDisabled();
  });

  it("shows singular item label for exactly 1 selected", () => {
    renderTab({ selectedEntryIds: new Set([1]), unitPrice: "10" });
    expect(
      screen.getByRole("button", { name: "Add 1 item" }),
    ).toBeInTheDocument();
  });

  it("shows plural items label for 2+ selected", () => {
    renderTab({ selectedEntryIds: new Set([1, 2]), unitPrice: "10" });
    expect(
      screen.getByRole("button", { name: "Add 2 items" }),
    ).toBeInTheDocument();
  });

  it("calls handleUnitPriceChange when the unit price input changes", () => {
    const handleUnitPriceChange = vi.fn();
    renderTab({ handleUnitPriceChange });
    fireEvent.change(screen.getByPlaceholderText("Unit price"), {
      target: { value: "12.5" },
    });
    expect(handleUnitPriceChange).toHaveBeenCalledWith("12.5");
  });

  it("calls toggleEntry when the checkbox itself is clicked, without double-firing from the row", () => {
    const toggleEntry = vi.fn();
    renderTab({
      billableEntries: [makeEntry({ id: 9, description: "Work" })],
      toggleEntry,
    });
    fireEvent.click(screen.getByRole("checkbox"));
    expect(toggleEntry).toHaveBeenCalledWith(9);
    expect(toggleEntry).toHaveBeenCalledTimes(1);
  });

  it("does not call toggleEntry when the checkbox for an already-added entry is clicked", () => {
    const toggleEntry = vi.fn();
    renderTab(
      { billableEntries: [makeEntry({ id: 9 })], toggleEntry },
      new Set([9]),
    );
    fireEvent.click(screen.getByRole("checkbox"));
    expect(toggleEntry).not.toHaveBeenCalled();
  });

  it("calls handleBulkAdd when the Add button is clicked", () => {
    const handleBulkAdd = vi.fn().mockResolvedValue(undefined);
    renderTab({
      selectedEntryIds: new Set([1]),
      unitPrice: "10",
      handleBulkAdd,
    });
    fireEvent.click(screen.getByRole("button", { name: "Add 1 item" }));
    expect(handleBulkAdd).toHaveBeenCalled();
  });

  it("shows Adding… when adding=true", () => {
    useTimeEntriesTabMock.mockReturnValue(defaultState());
    render(
      <TimeEntriesTab
        invoiceId={1}
        alreadyAddedEntryIds={new Set()}
        onAdd={vi.fn()}
        adding={true}
      />,
    );
    expect(screen.getByRole("button", { name: "Adding…" })).toBeInTheDocument();
  });
});
