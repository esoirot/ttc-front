import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryWrapper } from "@/test/queryClientWrapper";
import type { DashboardData } from "@/types/dashboard.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { useDashboard } from "./useDashboard";

function makeDashboard(overrides: Partial<DashboardData> = {}): DashboardData {
  return {
    activeProjectCount: 3,
    unpaidInvoiceCount: 1,
    monthToDateSeconds: 7200,
    monthToDateRevenue: 250,
    upcomingDeadlines: [],
    recentTimeEntries: [],
    prospectsToContact: [],
    ...overrides,
  };
}

describe("useDashboard", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
  });

  it("starts loading with a null dashboard", () => {
    gqlFetch.mockResolvedValueOnce({ dashboard: makeDashboard() });

    const { result } = renderHook(() => useDashboard(), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.dashboard).toBeNull();
  });

  it("returns the dashboard data once loaded", async () => {
    const dashboard = makeDashboard({ activeProjectCount: 5 });
    gqlFetch.mockResolvedValueOnce({ dashboard });

    const { result } = renderHook(() => useDashboard(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.dashboard).toEqual(dashboard);
  });
});
