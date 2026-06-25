import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryWrapper } from "@/test/queryClientWrapper";
import type { TimeEntry } from "@/types/time-entries.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));
const { apiGet } = vi.hoisted(() => ({ apiGet: vi.fn() }));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));
vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return { ...actual, apiGet };
});

import { useTimeEntriesPage } from "./useTimeEntriesPage";

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
    tags: [],
    createdAt: "2026-06-17T09:00:00.000Z",
    updatedAt: "2026-06-17T10:00:00.000Z",
    ...overrides,
  };
}

function defaultGqlFetch(entries: TimeEntry[]) {
  return (_doc: unknown, vars?: Record<string, unknown>) => {
    if ("start" in (vars ?? {})) {
      return Promise.resolve({
        timeEntries: {
          items: entries,
          nextCursor: null,
          total: entries.length,
        },
      });
    }
    return Promise.resolve({
      activeTimer: null,
      tags: [],
      projects: { items: [], nextCursor: null, total: 0 },
    });
  };
}

describe("useTimeEntriesPage", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
    apiGet.mockReset();
  });

  it("sums durations and dedupes recent descriptions", async () => {
    const entries = [
      makeEntry({ id: 1, description: "Translate", durationSeconds: 3600 }),
      makeEntry({ id: 2, description: "Translate", durationSeconds: 1800 }),
      makeEntry({ id: 3, description: "Review", durationSeconds: 900 }),
    ];
    gqlFetch.mockImplementation(defaultGqlFetch(entries));
    apiGet.mockResolvedValue({ connected: false, workspaceId: null });

    const { result } = renderHook(() => useTimeEntriesPage(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.totalSeconds).toBe(6300);
    expect(result.current.recentDescriptions).toEqual(["Translate", "Review"]);
  });

  it("resolves workspaceId from clockify status when connected", async () => {
    gqlFetch.mockImplementation(defaultGqlFetch([]));
    apiGet.mockResolvedValue({ connected: true, workspaceId: "w1" });

    const { result } = renderHook(() => useTimeEntriesPage(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.workspaceId).toBe("w1"));
  });

  it("workspaceId is null when clockify is not connected", async () => {
    gqlFetch.mockImplementation(defaultGqlFetch([]));
    apiGet.mockResolvedValue({ connected: false, workspaceId: "stale-id" });

    const { result } = renderHook(() => useTimeEntriesPage(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.workspaceId).toBeNull();
  });
});
