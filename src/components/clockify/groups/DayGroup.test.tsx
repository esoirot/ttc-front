import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ClockifyTimeEntry } from "@/types/clockify.types";

vi.mock("../rows/EntryRow", () => ({
  EntryRow: ({ entry }: { entry: ClockifyTimeEntry }) => (
    <div data-testid="entry-row" data-id={entry.id} />
  ),
}));

vi.mock("./DescriptionGroup", () => ({
  DescriptionGroup: ({ description }: { description: string }) => (
    <div data-testid="desc-group" data-desc={description} />
  ),
}));

import { DayGroup } from "./DayGroup";

function makeEntry(
  overrides: Partial<ClockifyTimeEntry> = {},
): ClockifyTimeEntry {
  return {
    id: "e1",
    description: "Translate",
    projectId: null,
    tagIds: [],
    timeInterval: {
      start: "2026-01-15T09:00:00.000Z",
      end: "2026-01-15T10:00:00.000Z",
      duration: "PT1H",
    },
    workspaceId: "ws-1",
    billable: true,
    ...overrides,
  };
}

const baseProps = {
  workspaceId: "ws-1",
  dayKey: "2026-01-15",
  projects: [],
  tags: [],
  billabilityLocked: false,
  onDelete: vi.fn(),
  onResume: vi.fn(),
  onUpdate: vi.fn(),
};

describe("DayGroup", () => {
  it("shows Today for today's dayKey", () => {
    const todayKey = new Date().toLocaleDateString("en-CA");
    render(
      <DayGroup {...baseProps} dayKey={todayKey} entries={[makeEntry()]} />,
    );
    expect(screen.getByText("Today")).toBeInTheDocument();
  });

  it("shows the entry count in the header", () => {
    render(
      <DayGroup
        {...baseProps}
        entries={[makeEntry({ id: "e1" }), makeEntry({ id: "e2" })]}
      />,
    );
    expect(screen.getByText("(2)")).toBeInTheDocument();
  });

  it("shows the total duration of finished entries", () => {
    const e1 = makeEntry({
      id: "e1",
      timeInterval: {
        start: "2026-01-15T09:00:00.000Z",
        end: "2026-01-15T10:00:00.000Z",
        duration: null,
      },
    });
    const e2 = makeEntry({
      id: "e2",
      description: "Review",
      timeInterval: {
        start: "2026-01-15T11:00:00.000Z",
        end: "2026-01-15T12:00:00.000Z",
        duration: null,
      },
    });
    render(<DayGroup {...baseProps} entries={[e1, e2]} />);
    expect(screen.getByText("02:00:00")).toBeInTheDocument();
  });

  it("is collapsed by default and does not render entries", () => {
    render(<DayGroup {...baseProps} entries={[makeEntry()]} />);
    expect(screen.queryByTestId("entry-row")).not.toBeInTheDocument();
    expect(screen.queryByTestId("desc-group")).not.toBeInTheDocument();
  });

  it("expands to show EntryRow when the header is clicked for a single-entry group", () => {
    render(<DayGroup {...baseProps} entries={[makeEntry({ id: "e1" })]} />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByTestId("entry-row")).toBeInTheDocument();
    expect(screen.queryByTestId("desc-group")).not.toBeInTheDocument();
  });

  it("expands to show DescriptionGroup for multiple entries with the same description", () => {
    const entries = [
      makeEntry({ id: "e1", description: "Translate" }),
      makeEntry({ id: "e2", description: "Translate" }),
    ];
    render(<DayGroup {...baseProps} entries={entries} />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByTestId("desc-group")).toBeInTheDocument();
    expect(screen.queryByTestId("entry-row")).not.toBeInTheDocument();
  });

  it("routes mixed entries: EntryRow for unique description, DescriptionGroup for repeated", () => {
    const entries = [
      makeEntry({ id: "e1", description: "Review" }),
      makeEntry({ id: "e2", description: "Translate" }),
      makeEntry({ id: "e3", description: "Translate" }),
    ];
    render(<DayGroup {...baseProps} entries={entries} />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByTestId("entry-row")).toBeInTheDocument();
    expect(screen.getByTestId("desc-group")).toBeInTheDocument();
  });

  it("shows running in the collapsed header time range for an entry with no end", () => {
    const running = makeEntry({
      id: "e1",
      timeInterval: {
        start: "2026-01-15T09:00:00.000Z",
        end: null,
        duration: null,
      },
    });
    render(<DayGroup {...baseProps} entries={[running]} />);
    expect(screen.getByText(/running/)).toBeInTheDocument();
  });

  it("hides the time range in the header when expanded", () => {
    const e1 = makeEntry({
      timeInterval: {
        start: "2026-01-15T09:00:00.000Z",
        end: "2026-01-15T10:00:00.000Z",
        duration: null,
      },
    });
    render(<DayGroup {...baseProps} entries={[e1]} />);
    fireEvent.click(screen.getByRole("button"));
    // "–" separator only appears in the collapsed time range span
    expect(screen.queryByText("–")).not.toBeInTheDocument();
  });
});
