import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../rows/TtcEntryRow", () => ({
  TtcEntryRow: ({ entry }: { entry: { id: number } }) => (
    <div data-testid="entry-row">{entry.id}</div>
  ),
}));
vi.mock("./TtcDescriptionGroup", () => ({
  TtcDescriptionGroup: ({ description }: { description: string }) => (
    <div data-testid="description-group">{description}</div>
  ),
}));

import { formatTime } from "@/components/clockify/helpers";
import type { TimeEntry } from "@/types/time-entries.types";
import { TtcDayGroup } from "./TtcDayGroup";

function makeEntry(overrides: Partial<TimeEntry> = {}): TimeEntry {
  return {
    id: 1,
    userId: 1,
    projectId: null,
    description: "Translate",
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

function baseProps(overrides: Partial<Parameters<typeof TtcDayGroup>[0]> = {}) {
  return {
    dayKey: "2026-06-01",
    entries: [makeEntry()],
    projects: [],
    tags: [],
    onDelete: vi.fn(),
    onResume: vi.fn(),
    onUpdate: vi.fn(),
    ...overrides,
  };
}

describe("TtcDayGroup", () => {
  it("shows the entry count and total duration in the collapsed header", () => {
    render(
      <TtcDayGroup
        {...baseProps({
          entries: [
            makeEntry({ id: 1, durationSeconds: 1800 }),
            makeEntry({ id: 2, durationSeconds: 1800 }),
          ],
        })}
      />,
    );

    expect(screen.getByText("(2)")).toBeInTheDocument();
    expect(screen.getByText("01:00:00")).toBeInTheDocument();
  });

  it("shows the earliest-latest time range when collapsed", () => {
    const start = "2026-06-01T08:00:00.000Z";
    const end = "2026-06-01T17:30:00.000Z";
    render(
      <TtcDayGroup
        {...baseProps({
          entries: [makeEntry({ startTime: start, endTime: end })],
        })}
      />,
    );

    expect(
      screen.getByText(`${formatTime(start)} - ${formatTime(end)}`),
    ).toBeInTheDocument();
  });

  it("shows 'running' as the end time when an entry has no endTime", () => {
    const start = "2026-06-01T08:00:00.000Z";
    render(
      <TtcDayGroup
        {...baseProps({
          entries: [makeEntry({ startTime: start, endTime: null })],
        })}
      />,
    );

    expect(
      screen.getByText(`${formatTime(start)} - running`),
    ).toBeInTheDocument();
  });

  it("starts collapsed with no rows rendered", () => {
    render(<TtcDayGroup {...baseProps()} />);

    expect(screen.queryByTestId("entry-row")).not.toBeInTheDocument();
  });

  it("expands to render a TtcEntryRow for a single-entry description group", () => {
    render(<TtcDayGroup {...baseProps()} />);

    fireEvent.click(screen.getByText("(1)"));

    expect(screen.getByTestId("entry-row")).toBeInTheDocument();
    expect(screen.queryByTestId("description-group")).not.toBeInTheDocument();
  });

  it("expands to render a TtcDescriptionGroup when 2+ entries share a description", () => {
    render(
      <TtcDayGroup
        {...baseProps({
          entries: [
            makeEntry({ id: 1, description: "Translate" }),
            makeEntry({ id: 2, description: "Translate" }),
          ],
        })}
      />,
    );

    fireEvent.click(screen.getByText("(2)"));

    expect(screen.getByTestId("description-group")).toHaveTextContent(
      "Translate",
    );
    expect(screen.queryByTestId("entry-row")).not.toBeInTheDocument();
  });

  it("hides the collapsed time range once expanded", () => {
    render(<TtcDayGroup {...baseProps()} />);

    fireEvent.click(screen.getByText("(1)"));

    expect(screen.queryByText(/ - /)).not.toBeInTheDocument();
  });
});
