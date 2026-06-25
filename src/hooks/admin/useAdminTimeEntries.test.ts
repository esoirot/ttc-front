import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createQueryClient,
  createQueryWrapper,
} from "@/test/queryClientWrapper";
import type { AdminConnection, AdminTimeEntry } from "@/types/admin.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import {
  useAdminDeleteTimeEntry,
  useAdminTimeEntries,
} from "./useAdminTimeEntries";

function makeAdminEntry(
  overrides: Partial<AdminTimeEntry> = {},
): AdminTimeEntry {
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
    owner: { id: 1, email: "owner@x.com", name: "Owner" },
    ...overrides,
  } as AdminTimeEntry;
}

function makeConnection(
  items: AdminTimeEntry[],
): AdminConnection<AdminTimeEntry> {
  return { items, nextCursor: null, total: items.length };
}

describe("useAdminTimeEntries", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("flattens the first page, optionally scoped to a user", async () => {
    const entry = makeAdminEntry();
    gqlFetch.mockResolvedValueOnce({
      adminTimeEntries: makeConnection([entry]),
    });

    const { result } = renderHook(() => useAdminTimeEntries(5), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.entries).toEqual([entry]);
    expect(gqlFetch.mock.calls[0][1].userId).toBe(5);
  });
});

describe("useAdminDeleteTimeEntry", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("removes the entry from cached pages and decrements total", async () => {
    gqlMutate.mockResolvedValueOnce({ adminDeleteTimeEntry: { id: 2 } });
    const queryClient = createQueryClient();
    const queryKey = ["adminTimeEntries", { userId: null }];
    queryClient.setQueryData(queryKey, {
      pages: [
        makeConnection([makeAdminEntry({ id: 1 }), makeAdminEntry({ id: 2 })]),
      ],
      pageParams: [undefined],
    });

    const { result } = renderHook(() => useAdminDeleteTimeEntry(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.deleteEntry(2);

    const cached = queryClient.getQueryData<{
      pages: AdminConnection<AdminTimeEntry>[];
    }>(queryKey);
    expect(cached?.pages[0].items.map((e) => e.id)).toEqual([1]);
    expect(cached?.pages[0].total).toBe(1);
  });
});
