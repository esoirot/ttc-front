import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createQueryClient,
  createQueryWrapper,
} from "@/test/queryClientWrapper";
import type { AdminConnection, AdminRate } from "@/types/admin.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { useAdminCrudRates, useAdminRates } from "./useAdminRates";

function makeAdminRate(overrides: Partial<AdminRate> = {}): AdminRate {
  return {
    id: 1,
    userId: 1,
    activityId: null,
    clientId: null,
    type: "HOURLY",
    name: "Standard",
    amount: 50,
    currency: "EUR",
    description: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    owner: { id: 1, email: "owner@x.com", name: "Owner" },
    ...overrides,
  } as AdminRate;
}

function makeConnection(items: AdminRate[]): AdminConnection<AdminRate> {
  return { items, nextCursor: null, total: items.length };
}

describe("useAdminRates", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("returns rates and total from the connection", async () => {
    const rate = makeAdminRate();
    gqlFetch.mockResolvedValueOnce({ adminRates: makeConnection([rate]) });

    const { result } = renderHook(() => useAdminRates(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.rates).toEqual([rate]);
    expect(result.current.total).toBe(1);
  });
});

describe("useAdminCrudRates", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("updateRate patches the matching rate in the cached connection", async () => {
    const updated = makeAdminRate({ id: 3, name: "Renamed" });
    gqlMutate.mockResolvedValueOnce({ adminUpdateRate: updated });
    const queryClient = createQueryClient();
    const queryKey = ["adminRates", { type: null }];
    queryClient.setQueryData(
      queryKey,
      makeConnection([makeAdminRate({ id: 3, name: "Old" })]),
    );

    const { result } = renderHook(() => useAdminCrudRates(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.updateRate({ id: 3, name: "Renamed" });

    const cached =
      queryClient.getQueryData<AdminConnection<AdminRate>>(queryKey);
    expect(cached?.items[0].name).toBe("Renamed");
  });

  it("deleteRate removes the rate and decrements total", async () => {
    gqlMutate.mockResolvedValueOnce({ adminDeleteRate: { id: 2 } });
    const queryClient = createQueryClient();
    const queryKey = ["adminRates", { type: null }];
    queryClient.setQueryData(
      queryKey,
      makeConnection([makeAdminRate({ id: 1 }), makeAdminRate({ id: 2 })]),
    );

    const { result } = renderHook(() => useAdminCrudRates(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.deleteRate(2);

    const cached =
      queryClient.getQueryData<AdminConnection<AdminRate>>(queryKey);
    expect(cached?.items.map((r) => r.id)).toEqual([1]);
    expect(cached?.total).toBe(1);
  });
});
