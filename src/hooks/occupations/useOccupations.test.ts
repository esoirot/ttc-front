import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createQueryClient,
  createQueryWrapper,
} from "@/test/queryClientWrapper";
import type { CustomOccupation } from "@/types/occupations.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import {
  useMyOccupations,
  useOccupation,
  useCreateOccupation,
  useUpdateOccupation,
  useDeleteOccupation,
  useCreateCharge,
  useUpdateCharge,
  useDeleteCharge,
} from "./useOccupations";

function makeOccupation(
  overrides: Partial<CustomOccupation> = {},
): CustomOccupation {
  return {
    id: 1,
    userId: 1,
    name: "Freelance",
    occupationType: "CUSTOM",
    charges: [],
    translationRates: [],
    customFields: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

beforeEach(() => {
  gqlFetch.mockReset();
  gqlMutate.mockReset();
});

describe("useMyOccupations", () => {
  it("fetches and returns the occupation list", async () => {
    const occupation = makeOccupation();
    gqlFetch.mockResolvedValueOnce({ myOccupations: [occupation] });

    const { result } = renderHook(() => useMyOccupations(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.occupations).toEqual([occupation]);
  });

  it("defaults to an empty array while loading", () => {
    gqlFetch.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useMyOccupations(), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.occupations).toEqual([]);
    expect(result.current.loading).toBe(true);
  });
});

describe("useOccupation", () => {
  it("fetches a single occupation by id", async () => {
    const occupation = makeOccupation({ id: 7 });
    gqlFetch.mockResolvedValueOnce({ occupation });

    const { result } = renderHook(() => useOccupation(7), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.occupation).toEqual(occupation);
    expect(gqlFetch.mock.calls[0][1]).toEqual({ id: 7 });
  });

  it("is disabled and returns null occupation when id is falsy", () => {
    const { result } = renderHook(() => useOccupation(0), {
      wrapper: createQueryWrapper(),
    });

    expect(gqlFetch).not.toHaveBeenCalled();
    expect(result.current.occupation).toBeNull();
  });
});

describe("useCreateOccupation", () => {
  it("appends the created occupation to the occupations cache", async () => {
    const created = makeOccupation({ id: 2, name: "New" });
    gqlMutate.mockResolvedValueOnce({ createOccupation: created });
    const queryClient = createQueryClient();
    queryClient.setQueryData(["occupations"], [makeOccupation({ id: 1 })]);

    const { result } = renderHook(() => useCreateOccupation(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.createOccupation({ name: "New" });

    expect(queryClient.getQueryData(["occupations"])).toEqual([
      makeOccupation({ id: 1 }),
      created,
    ]);
  });
});

describe("useUpdateOccupation", () => {
  it("patches the occupation in both the list cache and the single-occupation cache", async () => {
    const updated = makeOccupation({ id: 3, name: "Renamed" });
    gqlMutate.mockResolvedValueOnce({ updateOccupation: updated });
    const queryClient = createQueryClient();
    queryClient.setQueryData(
      ["occupations"],
      [makeOccupation({ id: 3, name: "Old" })],
    );

    const { result } = renderHook(() => useUpdateOccupation(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.updateOccupation({ id: 3, name: "Renamed" });

    expect(queryClient.getQueryData(["occupations"])).toEqual([updated]);
    expect(queryClient.getQueryData(["occupation", 3])).toEqual(updated);
  });
});

describe("useDeleteOccupation", () => {
  it("removes the occupation from the list cache and clears the single-occupation cache", async () => {
    gqlMutate.mockResolvedValueOnce({ deleteOccupation: true });
    const queryClient = createQueryClient();
    queryClient.setQueryData(["occupations"], [makeOccupation({ id: 9 })]);
    queryClient.setQueryData(["occupation", 9], makeOccupation({ id: 9 }));

    const { result } = renderHook(() => useDeleteOccupation(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.deleteOccupation(9);

    expect(queryClient.getQueryData(["occupations"])).toEqual([]);
    expect(queryClient.getQueryData(["occupation", 9])).toBeUndefined();
  });
});

describe("useCreateCharge", () => {
  it("sends the occupationId merged into the input and invalidates the occupation cache", async () => {
    gqlMutate.mockResolvedValueOnce({ createCharge: { id: 1 } });
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateCharge(5), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.createCharge({
      name: "Travel",
      amount: 20,
      type: "FIXED",
    });

    expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), {
      input: { name: "Travel", amount: 20, type: "FIXED", occupationId: 5 },
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["occupation", 5],
    });
  });
});

describe("useUpdateCharge", () => {
  it("invalidates the owning occupation cache on success", async () => {
    gqlMutate.mockResolvedValueOnce({ updateCharge: { id: 1 } });
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateCharge(8), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.updateCharge({ id: 1, name: "Renamed" });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["occupation", 8],
    });
  });
});

describe("useDeleteCharge", () => {
  it("invalidates the owning occupation cache on success", async () => {
    gqlMutate.mockResolvedValueOnce({ deleteCharge: true });
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteCharge(11), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.deleteCharge(1);

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["occupation", 11],
    });
  });
});
