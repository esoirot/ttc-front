import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createQueryClient,
  createQueryWrapper,
} from "@/test/queryClientWrapper";
import type {
  TimeEntry,
  TimeEntryConnection,
} from "@/types/time-entries.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import {
  useActiveTimer,
  useCreateTimeEntry,
  useDeleteTimeEntry,
  useStartTimer,
  useStopTimer,
  useTimeEntries,
  useUpdateTimeEntry,
} from "./useTimeEntries";

function makeEntry(overrides: Partial<TimeEntry> = {}): TimeEntry {
  return {
    id: 1,
    userId: 1,
    projectId: null,
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

function makeConnection(
  items: TimeEntry[],
  nextCursor: number | null = null,
): TimeEntryConnection {
  return { items, nextCursor, total: items.length };
}

describe("useTimeEntries", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("flattens the first page of entries", async () => {
    const entry = makeEntry();
    gqlFetch.mockResolvedValueOnce({ timeEntries: makeConnection([entry]) });

    const { result } = renderHook(() => useTimeEntries(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.entries).toEqual([entry]);
  });

  it("passes filters (projectIds, start, end) through to query variables", async () => {
    gqlFetch.mockResolvedValueOnce({ timeEntries: makeConnection([]) });

    renderHook(
      () =>
        useTimeEntries({
          projectIds: [1, 2],
          start: "2026-06-01T00:00:00.000Z",
          end: "2026-06-30T23:59:59.000Z",
        }),
      { wrapper: createQueryWrapper() },
    );

    await waitFor(() => expect(gqlFetch).toHaveBeenCalled());
    const vars = gqlFetch.mock.calls[0][1];
    expect(vars.projectIds).toEqual([1, 2]);
    expect(vars.start).toBe("2026-06-01T00:00:00.000Z");
    expect(vars.end).toBe("2026-06-30T23:59:59.000Z");
  });

  it("loadMore appends the next page via cursor", async () => {
    const first = makeEntry({ id: 1 });
    const second = makeEntry({ id: 2 });
    gqlFetch
      .mockResolvedValueOnce({ timeEntries: makeConnection([first], 2) })
      .mockResolvedValueOnce({ timeEntries: makeConnection([second], null) });

    const { result } = renderHook(() => useTimeEntries(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    result.current.loadMore();

    await waitFor(() => expect(result.current.entries).toHaveLength(2));
  });
});

describe("useActiveTimer", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("returns the active timer when one is running", async () => {
    const entry = makeEntry({ endTime: null });
    gqlFetch.mockResolvedValueOnce({ activeTimer: entry });

    const { result } = renderHook(() => useActiveTimer(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.activeTimer).toEqual(entry);
  });

  it("returns null when no timer is running", async () => {
    gqlFetch.mockResolvedValueOnce({ activeTimer: null });

    const { result } = renderHook(() => useActiveTimer(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.activeTimer).toBeNull();
  });
});

describe("useStartTimer", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("seeds the activeTimer cache with the started entry", async () => {
    const started = makeEntry({ id: 8, endTime: null });
    gqlMutate.mockResolvedValueOnce({ startTimer: started });
    const queryClient = createQueryClient();

    const { result } = renderHook(() => useStartTimer(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.startTimer({ description: "New task" });

    expect(queryClient.getQueryData(["activeTimer"])).toEqual(started);
  });
});

describe("useStopTimer", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("clears the activeTimer cache and invalidates timeEntries", async () => {
    const stopped = makeEntry({ id: 8 });
    gqlMutate.mockResolvedValueOnce({ stopTimer: stopped });
    const queryClient = createQueryClient();
    queryClient.setQueryData(
      ["activeTimer"],
      makeEntry({ id: 8, endTime: null }),
    );
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useStopTimer(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.stopTimer();

    expect(queryClient.getQueryData(["activeTimer"])).toBeNull();
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["timeEntries"] });
  });
});

describe("useUpdateTimeEntry", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("patches the matching entry across cached timeEntries pages", async () => {
    const updated = makeEntry({ id: 2, description: "Updated" });
    gqlMutate.mockResolvedValueOnce({ updateTimeEntry: updated });
    const queryClient = createQueryClient();
    const queryKey = [
      "timeEntries",
      { projectId: null, projectIds: null, start: null, end: null },
    ];
    queryClient.setQueryData(queryKey, {
      pages: [makeConnection([makeEntry({ id: 1 }), makeEntry({ id: 2 })])],
      pageParams: [undefined],
    });

    const { result } = renderHook(() => useUpdateTimeEntry(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.updateTimeEntry({ id: 2, description: "Updated" });

    const cached = queryClient.getQueryData<{
      pages: TimeEntryConnection[];
    }>(queryKey);
    expect(cached?.pages[0].items.find((e) => e.id === 2)?.description).toBe(
      "Updated",
    );
  });
});

describe("useDeleteTimeEntry", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("removes the deleted entry from cached pages and decrements total", async () => {
    gqlMutate.mockResolvedValueOnce({ deleteTimeEntry: true });
    const queryClient = createQueryClient();
    const queryKey = [
      "timeEntries",
      { projectId: null, projectIds: null, start: null, end: null },
    ];
    queryClient.setQueryData(queryKey, {
      pages: [makeConnection([makeEntry({ id: 1 }), makeEntry({ id: 2 })])],
      pageParams: [undefined],
    });

    const { result } = renderHook(() => useDeleteTimeEntry(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.deleteTimeEntry(1);

    const cached = queryClient.getQueryData<{
      pages: TimeEntryConnection[];
    }>(queryKey);
    expect(cached?.pages[0].items.map((e) => e.id)).toEqual([2]);
    expect(cached?.pages[0].total).toBe(1);
  });
});

describe("useCreateTimeEntry", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("invalidates timeEntries on success", async () => {
    const created = makeEntry({ id: 99 });
    gqlMutate.mockResolvedValueOnce({ createTimeEntry: created });
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateTimeEntry(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.createTimeEntry({
      startTime: "2026-06-17T09:00:00.000Z",
      endTime: "2026-06-17T10:00:00.000Z",
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["timeEntries"] });
  });
});
