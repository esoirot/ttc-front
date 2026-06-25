import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../rows/TtcEntryRow", () => ({
  TtcEntryRow: ({ entry }: { entry: { id: number } }) => (
    <div data-testid="entry-row">{entry.id}</div>
  ),
}));

import type { TimeEntry } from "@/types/time-entries.types";
import { TtcDescriptionGroup } from "./TtcDescriptionGroup";

function makeEntry(overrides: Partial<TimeEntry> = {}): TimeEntry {
  return {
    id: 1,
    userId: 1,
    projectId: null,
    description: "Translate",
    startTime: "2026-06-01T10:00:00.000Z",
    endTime: "2026-06-01T11:01:01.000Z",
    durationSeconds: 3661,
    billable: true,
    clockifyEntryId: null,
    tags: [],
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-01T10:00:00.000Z",
    ...overrides,
  };
}

function baseProps(
  overrides: Partial<Parameters<typeof TtcDescriptionGroup>[0]> = {},
) {
  return {
    description: "Translate",
    entries: [makeEntry()],
    projects: [],
    tags: [],
    onDelete: vi.fn(),
    onResume: vi.fn(),
    onUpdate: vi.fn(),
    ...overrides,
  };
}

describe("TtcDescriptionGroup", () => {
  it("shows the description, entry count, and total duration", () => {
    render(<TtcDescriptionGroup {...baseProps()} />);

    expect(screen.getByText("Translate")).toBeInTheDocument();
    expect(screen.getByText("×1")).toBeInTheDocument();
    expect(screen.getByText("01:01:01")).toBeInTheDocument();
  });

  it("shows 'No description' fallback when description is empty", () => {
    render(<TtcDescriptionGroup {...baseProps({ description: "" })} />);

    expect(screen.getByText("No description")).toBeInTheDocument();
  });

  it("sums durations across multiple entries", () => {
    render(
      <TtcDescriptionGroup
        {...baseProps({
          entries: [
            makeEntry({ id: 1, durationSeconds: 1800 }),
            makeEntry({ id: 2, durationSeconds: 1800 }),
          ],
        })}
      />,
    );

    expect(screen.getByText("01:00:00")).toBeInTheDocument();
    expect(screen.getByText("×2")).toBeInTheDocument();
  });

  it("starts collapsed and shows no entry rows", () => {
    render(<TtcDescriptionGroup {...baseProps()} />);

    expect(screen.queryByTestId("entry-row")).not.toBeInTheDocument();
  });

  it("expands to show entry rows when clicked, collapses on second click", () => {
    render(<TtcDescriptionGroup {...baseProps()} />);

    fireEvent.click(screen.getByText("Translate"));
    expect(screen.getByTestId("entry-row")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Translate"));
    expect(screen.queryByTestId("entry-row")).not.toBeInTheDocument();
  });
});
