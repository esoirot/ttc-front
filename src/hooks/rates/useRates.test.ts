import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createQueryClient,
  createQueryWrapper,
} from "@/test/queryClientWrapper";
import type { TranslationRate } from "@/types/rates.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import {
  useCreateRate,
  useDeleteRate,
  useRates,
  useUpdateRate,
} from "./useRates";

function makeRate(overrides: Partial<TranslationRate> = {}): TranslationRate {
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
    sourceLanguage: null,
    targetLanguage: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("useRates", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("fetches all rates when no type is given", async () => {
    const rate = makeRate();
    gqlFetch.mockResolvedValueOnce({ translationRates: [rate] });

    const { result } = renderHook(() => useRates(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.rates).toEqual([rate]);
    expect(gqlFetch.mock.calls[0][1]).toEqual({});
  });

  it("passes the type filter through to the query", async () => {
    gqlFetch.mockResolvedValueOnce({ translationRates: [] });

    renderHook(() => useRates("PER_WORD"), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(gqlFetch).toHaveBeenCalled());
    expect(gqlFetch.mock.calls[0][1]).toEqual({ type: "PER_WORD" });
  });
});

describe("useCreateRate", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("appends the new rate to both the overview and type-scoped caches", async () => {
    const created = makeRate({ id: 2, type: "FIXED" });
    gqlMutate.mockResolvedValueOnce({ createTranslationRate: created });
    const queryClient = createQueryClient();
    queryClient.setQueryData(["translationRates", null], []);

    const { result } = renderHook(() => useCreateRate(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.createRate({
      type: "FIXED",
      name: "Fixed",
      amount: 100,
      currency: "EUR",
    });

    expect(queryClient.getQueryData(["translationRates", null])).toEqual([
      created,
    ]);
    expect(queryClient.getQueryData(["translationRates", "FIXED"])).toEqual([
      created,
    ]);
  });

  it("invalidates the activity cache when an activityId is given", async () => {
    gqlMutate.mockResolvedValueOnce({ createTranslationRate: makeRate() });
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateRate(42), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.createRate({
      type: "HOURLY",
      name: "Standard",
      amount: 50,
      currency: "EUR",
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["activity", 42] });
  });
});

describe("useUpdateRate", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("patches the rate in both caches by id", async () => {
    const updated = makeRate({ id: 3, name: "Renamed", type: "HOURLY" });
    gqlMutate.mockResolvedValueOnce({ updateTranslationRate: updated });
    const queryClient = createQueryClient();
    queryClient.setQueryData(
      ["translationRates", null],
      [makeRate({ id: 3, name: "Old" })],
    );
    queryClient.setQueryData(
      ["translationRates", "HOURLY"],
      [makeRate({ id: 3, name: "Old" })],
    );

    const { result } = renderHook(() => useUpdateRate(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.updateRate({ id: 3, name: "Renamed" });

    expect(
      queryClient.getQueryData<TranslationRate[]>(["translationRates", null]),
    ).toEqual([updated]);
    expect(
      queryClient.getQueryData<TranslationRate[]>([
        "translationRates",
        "HOURLY",
      ]),
    ).toEqual([updated]);
  });
});

describe("useDeleteRate", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("removes the rate from the overview cache and every type-scoped cache", async () => {
    gqlMutate.mockResolvedValueOnce({ deleteTranslationRate: true });
    const queryClient = createQueryClient();
    queryClient.setQueryData(["translationRates", null], [makeRate({ id: 9 })]);
    queryClient.setQueryData(
      ["translationRates", "HOURLY"],
      [makeRate({ id: 9 })],
    );

    const { result } = renderHook(() => useDeleteRate(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.deleteRate(9);

    expect(queryClient.getQueryData(["translationRates", null])).toEqual([]);
    expect(queryClient.getQueryData(["translationRates", "HOURLY"])).toEqual(
      [],
    );
  });
});
