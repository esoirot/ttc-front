import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";
import { createQueryClient } from "@/test/queryClientWrapper";

const { gqlMutate } = vi.hoisted(() => ({ gqlMutate: vi.fn() }));
vi.mock("@/lib/apollo", () => ({ gqlFetch: vi.fn(), gqlMutate }));

import type { DashboardTimeEntry } from "@/types/dashboard.types";
import { RecentTimeEntries } from "./RecentTimeEntries";

function wrap(el: ReactElement) {
  return (
    <QueryClientProvider client={createQueryClient()}>{el}</QueryClientProvider>
  );
}

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
    render(wrap(<RecentTimeEntries entries={[]} />));

    expect(screen.getByText("No time entries yet.")).toBeInTheDocument();
  });

  it("renders each entry's description, date, time, and formatted duration", () => {
    render(wrap(<RecentTimeEntries entries={[makeEntry()]} />));

    expect(screen.getByText("Translate manual")).toBeInTheDocument();
    expect(screen.getByText("2026-06-17")).toBeInTheDocument();
    expect(screen.getByTitle("Click to edit start time")).toBeInTheDocument();
    expect(screen.getByText("1h 1m")).toBeInTheDocument();
  });

  it("falls back to a placeholder for a null description", () => {
    render(
      wrap(<RecentTimeEntries entries={[makeEntry({ description: null })]} />),
    );

    expect(screen.getByText("No description")).toBeInTheDocument();
  });

  it("shows 'running' for an entry with no duration", () => {
    render(
      wrap(
        <RecentTimeEntries entries={[makeEntry({ durationSeconds: null })]} />,
      ),
    );

    expect(screen.getByText("running")).toBeInTheDocument();
  });

  it("commits an edited start time via updateTimeEntry", async () => {
    gqlMutate.mockResolvedValue({
      updateTimeEntry: {
        ...makeEntry(),
        startTime: "2026-06-17T07:00:00.000Z",
      },
    });
    render(wrap(<RecentTimeEntries entries={[makeEntry()]} />));

    fireEvent.click(screen.getByTitle("Click to edit start time"));
    const input = screen.getByDisplayValue(/\d{2}:\d{2}/);
    fireEvent.change(input, { target: { value: "07:00" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => expect(gqlMutate).toHaveBeenCalledTimes(1));
    const [, vars] = gqlMutate.mock.calls[0] as [
      unknown,
      { input: { id: number; startTime: string } },
    ];
    expect(vars.input.id).toBe(1);
    expect(new Date(vars.input.startTime).getHours()).toBe(7);
  });
});
