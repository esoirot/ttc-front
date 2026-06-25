import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createQueryClient,
  createQueryWrapper,
} from "@/test/queryClientWrapper";
import type { RateSheet } from "@/types/rate-sheets.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import {
  useCreateRateSheet,
  useDeleteRateSheet,
  useRateSheets,
  useUpdateRateSheet,
} from "./useRateSheets";

function makeSheet(overrides: Partial<RateSheet> = {}): RateSheet {
  return {
    id: 1,
    userId: 1,
    activityId: null,
    clientId: null,
    name: "Standard EN-FR",
    description: null,
    sourceLanguage: "EN",
    targetLanguage: "FR",
    currency: "EUR",
    pricePerWord: 12,
    matchRates: {} as RateSheet["matchRates"],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("useRateSheets", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("returns the fetched rate sheets", async () => {
    const sheet = makeSheet();
    gqlFetch.mockResolvedValueOnce({ rateSheets: [sheet] });

    const { result } = renderHook(() => useRateSheets(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.rateSheets).toEqual([sheet]);
  });
});

describe("useCreateRateSheet", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("appends the new sheet to the cache", async () => {
    const created = makeSheet({ id: 2, name: "New" });
    gqlMutate.mockResolvedValueOnce({ createRateSheet: created });
    const queryClient = createQueryClient();
    queryClient.setQueryData(["rateSheets"], [makeSheet({ id: 1 })]);

    const { result } = renderHook(() => useCreateRateSheet(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.createRateSheet({
      name: "New",
      sourceLanguage: "EN",
      targetLanguage: "FR",
      currency: "EUR",
      pricePerWord: 10,
      matchRates: {} as RateSheet["matchRates"],
    });

    const sheets = queryClient.getQueryData<RateSheet[]>(["rateSheets"]);
    expect(sheets?.map((s) => s.id)).toEqual([1, 2]);
  });
});

describe("useUpdateRateSheet", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("patches the matching sheet in the cache", async () => {
    const updated = makeSheet({ id: 1, name: "Renamed" });
    gqlMutate.mockResolvedValueOnce({ updateRateSheet: updated });
    const queryClient = createQueryClient();
    queryClient.setQueryData(
      ["rateSheets"],
      [makeSheet({ id: 1, name: "Old" })],
    );

    const { result } = renderHook(() => useUpdateRateSheet(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.updateRateSheet({ id: 1, name: "Renamed" });

    const sheets = queryClient.getQueryData<RateSheet[]>(["rateSheets"]);
    expect(sheets?.[0].name).toBe("Renamed");
  });
});

describe("useDeleteRateSheet", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("removes the sheet from the cache", async () => {
    gqlMutate.mockResolvedValueOnce({ deleteRateSheet: true });
    const queryClient = createQueryClient();
    queryClient.setQueryData(
      ["rateSheets"],
      [makeSheet({ id: 1 }), makeSheet({ id: 2 })],
    );

    const { result } = renderHook(() => useDeleteRateSheet(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.deleteRateSheet(1);

    const sheets = queryClient.getQueryData<RateSheet[]>(["rateSheets"]);
    expect(sheets?.map((s) => s.id)).toEqual([2]);
  });
});
