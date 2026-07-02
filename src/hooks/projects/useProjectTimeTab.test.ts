import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryWrapper } from "@/test/queryClientWrapper";
import type {
  TimeEntry,
  TimeEntryConnection,
} from "@/types/time-entries.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { useProjectTimeTab } from "./useProjectTimeTab";

function makeEntry(overrides: Partial<TimeEntry> = {}): TimeEntry {
  return {
    id: 1,
    userId: 1,
    projectId: 1,
    description: "Work",
    startTime: "2026-06-17T09:00:00.000Z",
    endTime: "2026-06-17T10:00:00.000Z",
    durationSeconds: 3600,
    billable: true,
    clockifyEntryId: null,
    tags: [{ id: 1, name: "Urgent" }],
    createdAt: "2026-06-17T09:00:00.000Z",
    updatedAt: "2026-06-17T10:00:00.000Z",
    ...overrides,
  };
}

function makeConnection(items: TimeEntry[]): TimeEntryConnection {
  return { items, nextCursor: null, total: items.length };
}

function routeGqlFetch(
  vars: Record<string, unknown> = {},
  entries: TimeEntry[],
) {
  if ("projectId" in vars) {
    return Promise.resolve({ timeEntries: makeConnection(entries) });
  }
  return Promise.resolve({
    activeTimer: null,
    tags: [],
    projects: { items: [], nextCursor: null, total: 0 },
  });
}

describe("useProjectTimeTab", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("sums durations and dedupes non-empty descriptions", async () => {
    const entries = [
      makeEntry({ id: 1, durationSeconds: 3600, description: "Translate" }),
      makeEntry({ id: 2, durationSeconds: 1800, description: "Translate" }),
      makeEntry({ id: 3, durationSeconds: 900, description: null }),
      makeEntry({ id: 4, durationSeconds: 600, description: "  " }),
    ];
    gqlFetch.mockImplementation(
      (_doc: unknown, vars?: Record<string, unknown>) =>
        routeGqlFetch(vars, entries),
    );

    const { result } = renderHook(() => useProjectTimeTab(1), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.totalSeconds).toBe(6900);
    expect(result.current.recentDescriptions).toEqual(["Translate"]);
  });

  it("handleResume calls resumeTimeEntry with the entry id", async () => {
    const entry = makeEntry({
      id: 9,
      description: "Resume me",
      projectId: 3,
      billable: false,
      tags: [{ id: 5, name: "Billable" }],
    });
    gqlFetch.mockImplementation(
      (_doc: unknown, vars?: Record<string, unknown>) =>
        routeGqlFetch(vars, [entry]),
    );
    gqlMutate.mockResolvedValueOnce({ resumeTimeEntry: entry });

    const { result } = renderHook(() => useProjectTimeTab(1), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    result.current.handleResume(entry);

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), {
        id: 9,
      }),
    );
  });
});
