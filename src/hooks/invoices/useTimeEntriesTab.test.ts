import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryWrapper } from "@/test/queryClientWrapper";
import type { Project } from "@/types/projects.types";
import type { TimeEntry } from "@/types/time-entries.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { useTimeEntriesTab } from "./useTimeEntriesTab";

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 1,
    userId: 1,
    clientId: null,
    title: "Project",
    description: null,
    status: "ACTIVE",
    sourceLanguage: null,
    targetLanguage: null,
    wordCount: null,
    unitPrice: 25,
    fixedFee: null,
    hourlyRate: null,
    perWordRate: null,
    currency: "EUR",
    deadline: null,
    startDate: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeEntry(overrides: Partial<TimeEntry> = {}): TimeEntry {
  return {
    id: 1,
    userId: 1,
    projectId: 1,
    description: "Work",
    startTime: "2026-06-17T09:00:00.000Z",
    endTime: "2026-06-17T10:00:00.000Z",
    durationSeconds: 3600,
    billable: true,
    clockifyEntryId: null,
    tags: [],
    createdAt: "2026-06-17T09:00:00.000Z",
    updatedAt: "2026-06-17T10:00:00.000Z",
    ...overrides,
  };
}

function routeGqlFetch(
  vars: Record<string, unknown> = {},
  entries: TimeEntry[],
  projects: Project[],
) {
  if ("pagination" in vars && "projectId" in vars) {
    return Promise.resolve({
      timeEntries: { items: entries, nextCursor: null, total: entries.length },
    });
  }
  if ("pagination" in vars) {
    return Promise.resolve({
      projects: { items: projects, nextCursor: null, total: projects.length },
    });
  }
  return Promise.resolve({ translationRates: [] });
}

describe("useTimeEntriesTab", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("only includes billable entries with a known duration", async () => {
    const entries = [
      makeEntry({ id: 1, billable: true, durationSeconds: 3600 }),
      makeEntry({ id: 2, billable: false, durationSeconds: 1800 }),
      makeEntry({ id: 3, billable: true, durationSeconds: null }),
    ];
    gqlFetch.mockImplementation(
      (_doc: unknown, vars?: Record<string, unknown>) =>
        routeGqlFetch(vars, entries, []),
    );

    const { result } = renderHook(() => useTimeEntriesTab(1, vi.fn()), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.entriesLoading).toBe(false));
    expect(result.current.billableEntries.map((e) => e.id)).toEqual([1]);
  });

  it("handleProjectChange resets selection and pre-fills unit price from the project", async () => {
    const project = makeProject({ id: 2, unitPrice: 30 });
    gqlFetch.mockImplementation(
      (_doc: unknown, vars?: Record<string, unknown>) =>
        routeGqlFetch(vars, [], [project]),
    );

    const { result } = renderHook(() => useTimeEntriesTab(1, vi.fn()), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.entriesLoading).toBe(false));

    act(() => {
      result.current.toggleEntry(5);
    });
    expect(result.current.selectedEntryIds.has(5)).toBe(true);

    act(() => {
      result.current.handleProjectChange("2");
    });

    expect(result.current.selectedProjectId).toBe("2");
    expect(result.current.unitPrice).toBe("30");
    expect(result.current.selectedEntryIds.size).toBe(0);
  });

  it("handleRateChange sets the unit price from the selected rate's amount", async () => {
    gqlFetch.mockImplementation(
      (_doc: unknown, vars?: Record<string, unknown>) => {
        if ("pagination" in (vars ?? {})) return routeGqlFetch(vars, [], []);
        return Promise.resolve({
          translationRates: [
            {
              id: 7,
              userId: 1,
              type: "HOURLY",
              name: "Standard",
              amount: 45,
              currency: "EUR",
              description: null,
              createdAt: "2026-01-01T00:00:00.000Z",
              updatedAt: "2026-01-01T00:00:00.000Z",
            },
          ],
        });
      },
    );

    const { result } = renderHook(() => useTimeEntriesTab(1, vi.fn()), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.rates).toHaveLength(1));

    act(() => {
      result.current.handleRateChange("7");
    });

    expect(result.current.unitPrice).toBe("45");
  });

  it("handleUnitPriceChange clears the selected rate", async () => {
    gqlFetch.mockImplementation(
      (_doc: unknown, vars?: Record<string, unknown>) =>
        routeGqlFetch(vars, [], []),
    );

    const { result } = renderHook(() => useTimeEntriesTab(1, vi.fn()), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.entriesLoading).toBe(false));

    act(() => {
      result.current.handleUnitPriceChange("99");
    });

    expect(result.current.unitPrice).toBe("99");
    expect(result.current.selectedRateId).toBe("");
  });

  it("handleBulkAdd converts selected entries to invoice items in hours and clears selection", async () => {
    const entries = [
      makeEntry({ id: 1, durationSeconds: 3600, description: "Translate" }),
      makeEntry({ id: 2, durationSeconds: 1800, description: null }),
    ];
    gqlFetch.mockImplementation(
      (_doc: unknown, vars?: Record<string, unknown>) =>
        routeGqlFetch(vars, entries, []),
    );
    const onAdd = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => useTimeEntriesTab(42, onAdd), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.entriesLoading).toBe(false));

    act(() => {
      result.current.toggleEntry(1);
      result.current.toggleEntry(2);
      result.current.handleUnitPriceChange("20");
    });

    await act(async () => {
      await result.current.handleBulkAdd();
    });

    expect(onAdd).toHaveBeenCalledWith({
      invoiceId: 42,
      description: "Translate",
      quantity: 1,
      unitPrice: 20,
      projectId: 1,
      timeEntryId: 1,
    });
    expect(onAdd).toHaveBeenCalledWith({
      invoiceId: 42,
      description: "Time entry",
      quantity: 0.5,
      unitPrice: 20,
      projectId: 1,
      timeEntryId: 2,
    });
    expect(result.current.selectedEntryIds.size).toBe(0);
  });
});
