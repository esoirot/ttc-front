import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ClockifyTimeEntry } from "@/types/clockify.types";

vi.mock("../rows/EntryRow", () => ({
  EntryRow: ({ entry }: { entry: ClockifyTimeEntry }) => (
    <div data-testid="entry-row" data-id={entry.id} />
  ),
}));

import { DescriptionGroup } from "./DescriptionGroup";

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
  projects: [],
  tags: [],
  billabilityLocked: false,
  onDelete: vi.fn(),
  onResume: vi.fn(),
  onUpdate: vi.fn(),
};

describe("DescriptionGroup", () => {
  it("shows the description text", () => {
    render(
      <DescriptionGroup
        {...baseProps}
        description="Translate docs"
        entries={[makeEntry(), makeEntry({ id: "e2" })]}
      />,
    );
    expect(screen.getByText("Translate docs")).toBeInTheDocument();
  });

  it("shows No description when description is empty", () => {
    render(
      <DescriptionGroup
        {...baseProps}
        description=""
        entries={[makeEntry(), makeEntry({ id: "e2" })]}
      />,
    );
    expect(screen.getByText("No description")).toBeInTheDocument();
  });

  it("shows the entry count", () => {
    render(
      <DescriptionGroup
        {...baseProps}
        description="Translate"
        entries={[
          makeEntry(),
          makeEntry({ id: "e2" }),
          makeEntry({ id: "e3" }),
        ]}
      />,
    );
    expect(screen.getByText("x3")).toBeInTheDocument();
  });

  it("shows the summed duration of all entries", () => {
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
      timeInterval: {
        start: "2026-01-15T11:00:00.000Z",
        end: "2026-01-15T12:00:00.000Z",
        duration: null,
      },
    });
    render(
      <DescriptionGroup
        {...baseProps}
        description="Translate"
        entries={[e1, e2]}
      />,
    );
    expect(screen.getByText("02:00:00")).toBeInTheDocument();
  });

  it("is collapsed by default and does not show EntryRows", () => {
    render(
      <DescriptionGroup
        {...baseProps}
        description="Translate"
        entries={[makeEntry(), makeEntry({ id: "e2" })]}
      />,
    );
    expect(screen.queryByTestId("entry-row")).not.toBeInTheDocument();
  });

  it("reveals EntryRows when the expand button is clicked", () => {
    render(
      <DescriptionGroup
        {...baseProps}
        description="Translate"
        entries={[makeEntry({ id: "e1" }), makeEntry({ id: "e2" })]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Expand entries" }));
    expect(screen.getAllByTestId("entry-row")).toHaveLength(2);
  });

  it("hides EntryRows again when the collapse button is clicked", () => {
    render(
      <DescriptionGroup
        {...baseProps}
        description="Translate"
        entries={[makeEntry(), makeEntry({ id: "e2" })]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Expand entries" }));
    fireEvent.click(screen.getByRole("button", { name: "Collapse entries" }));
    expect(screen.queryByTestId("entry-row")).not.toBeInTheDocument();
  });

  it("skips running entries in the duration total", () => {
    const running = makeEntry({
      id: "e2",
      timeInterval: {
        start: "2026-01-15T11:00:00.000Z",
        end: null,
        duration: null,
      },
    });
    const finished = makeEntry({
      id: "e1",
      timeInterval: {
        start: "2026-01-15T09:00:00.000Z",
        end: "2026-01-15T10:00:00.000Z",
        duration: null,
      },
    });
    render(
      <DescriptionGroup
        {...baseProps}
        description="Translate"
        entries={[finished, running]}
      />,
    );
    // Only the finished entry (1h) counted
    expect(screen.getByText("01:00:00")).toBeInTheDocument();
  });
});
