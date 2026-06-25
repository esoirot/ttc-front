import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../groups/TtcDayGroup", () => ({
  TtcDayGroup: ({ dayKey }: { dayKey: string }) => (
    <div data-testid="day-group">{dayKey}</div>
  ),
}));

import type { TimeEntry } from "@/types/time-entries.types";
import { EntryList } from "./EntryList";

function makeEntry(overrides: Partial<TimeEntry> = {}): TimeEntry {
  return {
    id: 1,
    userId: 1,
    projectId: null,
    description: "Work",
    startTime: "2026-06-01T10:00:00.000Z",
    endTime: "2026-06-01T11:00:00.000Z",
    durationSeconds: 3600,
    billable: true,
    clockifyEntryId: null,
    tags: [],
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-01T10:00:00.000Z",
    ...overrides,
  };
}

function baseProps(overrides: Partial<Parameters<typeof EntryList>[0]> = {}) {
  return {
    entries: [],
    loading: false,
    hasMore: false,
    loadMore: vi.fn(),
    deleteTimeEntry: vi.fn(),
    projects: [],
    tags: [],
    onResume: vi.fn(),
    onUpdate: vi.fn(),
    ...overrides,
  };
}

describe("EntryList", () => {
  it("shows skeletons while loading with no entries yet", () => {
    const { container } = render(
      <EntryList {...baseProps({ loading: true, entries: [] })} />,
    );

    expect(
      container.querySelectorAll('[class*="animate-pulse"]').length,
    ).toBeGreaterThan(0);
  });

  it("shows an empty state when there are no entries and not loading", () => {
    render(<EntryList {...baseProps({ entries: [] })} />);

    expect(screen.getByText("No entries in this period.")).toBeInTheDocument();
  });

  it("renders one day group per grouped day", () => {
    render(
      <EntryList
        {...baseProps({
          entries: [
            makeEntry({ id: 1, startTime: "2026-06-01T10:00:00.000Z" }),
            makeEntry({ id: 2, startTime: "2026-06-02T10:00:00.000Z" }),
          ],
        })}
      />,
    );

    expect(screen.getAllByTestId("day-group")).toHaveLength(2);
  });

  it("shows entries even while loading is true, once entries exist", () => {
    render(
      <EntryList {...baseProps({ loading: true, entries: [makeEntry()] })} />,
    );

    expect(screen.getByTestId("day-group")).toBeInTheDocument();
  });

  it("shows the Load more button only when hasMore is true", () => {
    const { rerender } = render(
      <EntryList {...baseProps({ entries: [makeEntry()], hasMore: false })} />,
    );
    expect(screen.queryByText("Load more")).not.toBeInTheDocument();

    rerender(
      <EntryList {...baseProps({ entries: [makeEntry()], hasMore: true })} />,
    );
    expect(screen.getByText("Load more")).toBeInTheDocument();
  });

  it("calls loadMore when the button is clicked", () => {
    const loadMore = vi.fn();
    render(
      <EntryList
        {...baseProps({ entries: [makeEntry()], hasMore: true, loadMore })}
      />,
    );

    fireEvent.click(screen.getByText("Load more"));
    expect(loadMore).toHaveBeenCalled();
  });
});
