import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryWrapper } from "@/test/queryClientWrapper";
import type { AdminStats } from "@/types/admin.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { useAdminStats } from "./useAdminStats";

describe("useAdminStats", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
  });

  it("starts with a null stats object while loading", () => {
    gqlFetch.mockResolvedValueOnce({
      adminStats: {} as AdminStats,
    });

    const { result } = renderHook(() => useAdminStats(), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.stats).toBeNull();
  });

  it("returns the fetched stats", async () => {
    const stats: AdminStats = {
      totalUsers: 5,
      totalClients: 10,
      totalProjects: 20,
      totalInvoices: 8,
      totalRevenue: 1000,
      totalTimeSeconds: 3600,
    };
    gqlFetch.mockResolvedValueOnce({ adminStats: stats });

    const { result } = renderHook(() => useAdminStats(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.stats).toEqual(stats);
  });
});
