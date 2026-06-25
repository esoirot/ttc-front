import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createQueryClient,
  createQueryWrapper,
} from "@/test/queryClientWrapper";
import type { CustomActivity } from "@/types/activities.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import {
  useMyActivities,
  useActivity,
  useCreateActivity,
  useUpdateActivity,
  useDeleteActivity,
  useCreateCharge,
  useUpdateCharge,
  useDeleteCharge,
} from "./useActivities";

function makeActivity(overrides: Partial<CustomActivity> = {}): CustomActivity {
  return {
    id: 1,
    userId: 1,
    name: "Freelance",
    activityType: "CUSTOM",
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

describe("useMyActivities", () => {
  it("fetches and returns the activity list", async () => {
    const activity = makeActivity();
    gqlFetch.mockResolvedValueOnce({ myActivities: [activity] });

    const { result } = renderHook(() => useMyActivities(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.activities).toEqual([activity]);
  });

  it("defaults to an empty array while loading", () => {
    gqlFetch.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useMyActivities(), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.activities).toEqual([]);
    expect(result.current.loading).toBe(true);
  });
});

describe("useActivity", () => {
  it("fetches a single activity by id", async () => {
    const activity = makeActivity({ id: 7 });
    gqlFetch.mockResolvedValueOnce({ activity });

    const { result } = renderHook(() => useActivity(7), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.activity).toEqual(activity);
    expect(gqlFetch.mock.calls[0][1]).toEqual({ id: 7 });
  });

  it("is disabled and returns null activity when id is falsy", () => {
    const { result } = renderHook(() => useActivity(0), {
      wrapper: createQueryWrapper(),
    });

    expect(gqlFetch).not.toHaveBeenCalled();
    expect(result.current.activity).toBeNull();
  });
});

describe("useCreateActivity", () => {
  it("appends the created activity to the activities cache", async () => {
    const created = makeActivity({ id: 2, name: "New" });
    gqlMutate.mockResolvedValueOnce({ createActivity: created });
    const queryClient = createQueryClient();
    queryClient.setQueryData(["activities"], [makeActivity({ id: 1 })]);

    const { result } = renderHook(() => useCreateActivity(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.createActivity({ name: "New" });

    expect(queryClient.getQueryData(["activities"])).toEqual([
      makeActivity({ id: 1 }),
      created,
    ]);
  });
});

describe("useUpdateActivity", () => {
  it("patches the activity in both the list cache and the single-activity cache", async () => {
    const updated = makeActivity({ id: 3, name: "Renamed" });
    gqlMutate.mockResolvedValueOnce({ updateActivity: updated });
    const queryClient = createQueryClient();
    queryClient.setQueryData(
      ["activities"],
      [makeActivity({ id: 3, name: "Old" })],
    );

    const { result } = renderHook(() => useUpdateActivity(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.updateActivity({ id: 3, name: "Renamed" });

    expect(queryClient.getQueryData(["activities"])).toEqual([updated]);
    expect(queryClient.getQueryData(["activity", 3])).toEqual(updated);
  });
});

describe("useDeleteActivity", () => {
  it("removes the activity from the list cache and clears the single-activity cache", async () => {
    gqlMutate.mockResolvedValueOnce({ deleteActivity: true });
    const queryClient = createQueryClient();
    queryClient.setQueryData(["activities"], [makeActivity({ id: 9 })]);
    queryClient.setQueryData(["activity", 9], makeActivity({ id: 9 }));

    const { result } = renderHook(() => useDeleteActivity(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.deleteActivity(9);

    expect(queryClient.getQueryData(["activities"])).toEqual([]);
    expect(queryClient.getQueryData(["activity", 9])).toBeUndefined();
  });
});

describe("useCreateCharge", () => {
  it("sends the activityId merged into the input and invalidates the activity cache", async () => {
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
      input: { name: "Travel", amount: 20, type: "FIXED", activityId: 5 },
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["activity", 5],
    });
  });
});

describe("useUpdateCharge", () => {
  it("invalidates the owning activity cache on success", async () => {
    gqlMutate.mockResolvedValueOnce({ updateCharge: { id: 1 } });
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateCharge(8), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.updateCharge({ id: 1, name: "Renamed" });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["activity", 8],
    });
  });
});

describe("useDeleteCharge", () => {
  it("invalidates the owning activity cache on success", async () => {
    gqlMutate.mockResolvedValueOnce({ deleteCharge: true });
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteCharge(11), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.deleteCharge(1);

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["activity", 11],
    });
  });
});
