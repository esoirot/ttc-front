import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { DashboardTimeEntry } from "@/types/dashboard.types";
import { RecentTimeEntries } from "./RecentTimeEntries";

function makeEntry(
  overrides: Partial<DashboardTimeEntry> = {},
): DashboardTimeEntry {
  return {
    id: 1,
    description: "Translate manual",
    startTime: "2026-06-17T09:30:00.000Z",
    durationSeconds: 3661,
    ...overrides,
  };
}

describe("RecentTimeEntries", () => {
  it("shows an empty state when there are no entries", () => {
    render(<RecentTimeEntries entries={[]} />);

    expect(screen.getByText("No time entries yet.")).toBeInTheDocument();
  });

  it("renders each entry's description, time, and formatted duration", () => {
    render(<RecentTimeEntries entries={[makeEntry()]} />);

    expect(screen.getByText("Translate manual")).toBeInTheDocument();
    expect(screen.getByText("2026-06-17 09:30")).toBeInTheDocument();
    expect(screen.getByText("1h 1m")).toBeInTheDocument();
  });

  it("falls back to a placeholder for a null description", () => {
    render(<RecentTimeEntries entries={[makeEntry({ description: null })]} />);

    expect(screen.getByText("No description")).toBeInTheDocument();
  });

  it("shows 'running' for an entry with no duration", () => {
    render(
      <RecentTimeEntries entries={[makeEntry({ durationSeconds: null })]} />,
    );

    expect(screen.getByText("running")).toBeInTheDocument();
  });
});
