import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createQueryClient,
  createQueryWrapper,
} from "@/test/queryClientWrapper";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { useCreateTag, useDeleteTag, useTags } from "./useTags";

describe("useTags", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("returns the fetched tags", async () => {
    gqlFetch.mockResolvedValueOnce({ tags: [{ id: 1, name: "Urgent" }] });

    const { result } = renderHook(() => useTags(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.tags).toEqual([{ id: 1, name: "Urgent" }]);
  });

  it("returns an empty array before data loads", () => {
    gqlFetch.mockResolvedValueOnce({ tags: [] });

    const { result } = renderHook(() => useTags(), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.tags).toEqual([]);
  });
});

describe("useCreateTag", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("appends the new tag to the tags cache", async () => {
    gqlMutate.mockResolvedValueOnce({ createTag: { id: 2, name: "Billable" } });
    const queryClient = createQueryClient();
    queryClient.setQueryData(["tags"], [{ id: 1, name: "Urgent" }]);

    const { result } = renderHook(() => useCreateTag(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.createTag("Billable");

    expect(queryClient.getQueryData(["tags"])).toEqual([
      { id: 1, name: "Urgent" },
      { id: 2, name: "Billable" },
    ]);
  });
});

describe("useDeleteTag", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("removes the tag from the tags cache by id", async () => {
    gqlMutate.mockResolvedValueOnce({ deleteTag: true });
    const queryClient = createQueryClient();
    queryClient.setQueryData(
      ["tags"],
      [
        { id: 1, name: "Urgent" },
        { id: 2, name: "Billable" },
      ],
    );

    const { result } = renderHook(() => useDeleteTag(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.deleteTag(1);

    expect(queryClient.getQueryData(["tags"])).toEqual([
      { id: 2, name: "Billable" },
    ]);
  });
});
