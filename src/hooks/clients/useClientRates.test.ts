import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createQueryClient,
  createQueryWrapper,
} from "@/test/queryClientWrapper";
import type { ClientRate } from "@/types/client-rates.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import {
  useClientRates,
  useCreateClientRate,
  useDeleteClientRate,
  useUpdateClientRate,
} from "./useClientRates";

function makeRate(overrides: Partial<ClientRate> = {}): ClientRate {
  return {
    id: 1,
    clientId: 5,
    userId: 1,
    type: "HOURLY",
    name: "Discounted",
    amount: 40,
    currency: "EUR",
    description: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("useClientRates", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("does not query when clientId is null", () => {
    renderHook(() => useClientRates(null), {
      wrapper: createQueryWrapper(),
    });

    expect(gqlFetch).not.toHaveBeenCalled();
  });

  it("fetches rates for a given client", async () => {
    const rate = makeRate();
    gqlFetch.mockResolvedValueOnce({ clientRates: [rate] });

    const { result } = renderHook(() => useClientRates(5), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.clientRates).toEqual([rate]);
    expect(gqlFetch.mock.calls[0][1]).toEqual({ clientId: 5 });
  });
});

describe("useCreateClientRate", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("appends the new rate scoped to the client cache", async () => {
    const created = makeRate({ id: 2 });
    gqlMutate.mockResolvedValueOnce({ createClientRate: created });
    const queryClient = createQueryClient();

    const { result } = renderHook(() => useCreateClientRate(5), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.createClientRate({
      type: "HOURLY",
      name: "Discounted",
      amount: 40,
      currency: "EUR",
      description: null,
    });

    expect(queryClient.getQueryData(["clientRates", 5])).toEqual([created]);
  });
});

describe("useUpdateClientRate", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("patches the matching rate in the client-scoped cache", async () => {
    const updated = makeRate({ id: 1, name: "Renamed" });
    gqlMutate.mockResolvedValueOnce({ updateClientRate: updated });
    const queryClient = createQueryClient();
    queryClient.setQueryData(
      ["clientRates", 5],
      [makeRate({ id: 1, name: "Old" })],
    );

    const { result } = renderHook(() => useUpdateClientRate(5), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.updateClientRate({ id: 1, name: "Renamed" });

    const rates = queryClient.getQueryData<ClientRate[]>(["clientRates", 5]);
    expect(rates?.[0].name).toBe("Renamed");
  });
});

describe("useDeleteClientRate", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("removes the rate from the client-scoped cache", async () => {
    gqlMutate.mockResolvedValueOnce({ deleteClientRate: true });
    const queryClient = createQueryClient();
    queryClient.setQueryData(
      ["clientRates", 5],
      [makeRate({ id: 1 }), makeRate({ id: 2 })],
    );

    const { result } = renderHook(() => useDeleteClientRate(5), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.deleteClientRate(1);

    const rates = queryClient.getQueryData<ClientRate[]>(["clientRates", 5]);
    expect(rates?.map((r) => r.id)).toEqual([2]);
  });
});
