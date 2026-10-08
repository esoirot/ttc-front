import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createQueryWrapper } from "@/test/queryClientWrapper";
import { PROJECT_ACTIVITIES_QUERY } from "@/graphql/tasks.operations";

const { gqlFetch } = vi.hoisted(() => ({ gqlFetch: vi.fn() }));
vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate: vi.fn() }));

import { useProjectActivities } from "./useProjectActivities";

describe("useProjectActivities", () => {
  it("pages the project's activity 20 at a time", async () => {
    const event = { id: 1, type: "CREATED" };
    gqlFetch.mockResolvedValueOnce({
      projectActivities: { items: [event], nextCursor: 1, total: 21 },
    });

    const { result } = renderHook(() => useProjectActivities(7), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.items).toEqual([event]));
    expect(result.current.hasMore).toBe(true);
    expect(gqlFetch).toHaveBeenCalledWith(PROJECT_ACTIVITIES_QUERY, {
      projectId: 7,
      pagination: { limit: 20 },
    });
  });
});
