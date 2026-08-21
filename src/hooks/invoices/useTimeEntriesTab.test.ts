import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryWrapper } from "@/test/queryClientWrapper";
import type { Project } from "@/types/projects.types";
import type { TimeEntry } from "@/types/time-entries.types";
import type { RateSheet } from "@/types/rate-sheets.types";
import { defaultMatchRates } from "@/constants/matchRateItems";
import { RATE_SHEETS_QUERY } from "@/graphql/rate-sheets.operations";

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
    useCustomRate: false,
    rateSheetId: null,
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
    invoicingStatus: "NO",
    tags: [],
    createdAt: "2026-06-17T09:00:00.000Z",
    updatedAt: "2026-06-17T10:00:00.000Z",
    ...overrides,
  };
}

function makeSheet(overrides: Partial<RateSheet> = {}): RateSheet {
  return {
    id: 1,
    userId: 1,
    activityId: null,
    clientId: 5,
    name: "EN-FR standard",
    description: null,
    sourceLanguage: "EN",
    targetLanguage: "FR",
    currency: "EUR",
    pricePerWord: 0.12,
    matchRates: defaultMatchRates(),
    isDefault: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function routeGqlFetch(
  doc: unknown,
  vars: Record<string, unknown> = {},
  entries: TimeEntry[],
  projects: Project[],
  rateSheets: RateSheet[] = [],
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
  if (doc === RATE_SHEETS_QUERY) {
    return Promise.resolve({ rateSheets });
  }
  return Promise.resolve({ translationRates: [] });
}

describe("useTimeEntriesTab", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("excludes billable entries once invoicingStatus is INVOICED, but keeps entries missing duration/words", async () => {
    const entries = [
      makeEntry({ id: 1, billable: true, invoicingStatus: "NO" }),
      makeEntry({ id: 2, billable: false, invoicingStatus: "NO" }),
      makeEntry({ id: 3, billable: true, invoicingStatus: "INVOICED" }),
      makeEntry({ id: 4, billable: true, durationSeconds: null }),
    ];
    gqlFetch.mockImplementation(
      (doc: unknown, vars?: Record<string, unknown>) =>
        routeGqlFetch(doc, vars, entries, []),
    );

    const { result } = renderHook(() => useTimeEntriesTab(1, vi.fn()), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.entriesLoading).toBe(false));
    expect(result.current.billableEntries.map((e) => e.id)).toEqual([1, 4]);
  });

  it("handleProjectChange resets selection and pre-fills unit price from the project's resolved per-word rate for a translation project", async () => {
    const sheet = makeSheet({ pricePerWord: 0.12 });
    const project = makeProject({
      id: 2,
      clientId: sheet.clientId,
      sourceLanguage: sheet.sourceLanguage,
      targetLanguage: sheet.targetLanguage,
      useCustomRate: false,
      activities: [{ id: 1, name: "Translation", activityType: "TRANSLATOR" }],
    });
    gqlFetch.mockImplementation(
      (doc: unknown, vars?: Record<string, unknown>) =>
        routeGqlFetch(doc, vars, [], [project], [sheet]),
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
    expect(result.current.unitPrice).toBe("0.12");
    expect(result.current.selectedEntryIds.size).toBe(0);
  });

  it("handleProjectChange leaves unit price blank for a non-translation project", async () => {
    const project = makeProject({
      id: 3,
      activities: [{ id: 2, name: "Proofreading", activityType: "CORRECTOR" }],
    });
    gqlFetch.mockImplementation(
      (doc: unknown, vars?: Record<string, unknown>) =>
        routeGqlFetch(doc, vars, [], [project]),
    );

    const { result } = renderHook(() => useTimeEntriesTab(1, vi.fn()), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.entriesLoading).toBe(false));

    act(() => {
      result.current.handleProjectChange("3");
    });

    expect(result.current.unitPrice).toBe("");
  });

  it("handleRateChange sets the unit price from the selected rate's amount", async () => {
    gqlFetch.mockImplementation(
      (doc: unknown, vars?: Record<string, unknown>) => {
        if ("pagination" in (vars ?? {}))
          return routeGqlFetch(doc, vars, [], []);
        if (doc === RATE_SHEETS_QUERY)
          return Promise.resolve({ rateSheets: [] });
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
      (doc: unknown, vars?: Record<string, unknown>) =>
        routeGqlFetch(doc, vars, [], []),
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

  it("handleBulkAdd prices non-translation entries by duration in hours and clears selection", async () => {
    const entries = [
      makeEntry({ id: 1, durationSeconds: 3600, description: "Translate" }),
      makeEntry({ id: 2, durationSeconds: 1800, description: null }),
    ];
    gqlFetch.mockImplementation(
      (doc: unknown, vars?: Record<string, unknown>) =>
        routeGqlFetch(doc, vars, entries, []),
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

  it("handleBulkAdd prices translation entries by wordsProcessed times the resolved per-word rate", async () => {
    const sheet = makeSheet({ pricePerWord: 0.12 });
    const project = makeProject({
      id: 1,
      clientId: sheet.clientId,
      sourceLanguage: sheet.sourceLanguage,
      targetLanguage: sheet.targetLanguage,
      useCustomRate: false,
    });
    const entries = [
      makeEntry({
        id: 1,
        description: "Translate",
        wordsProcessed: 1000,
        activity: { id: 1, name: "Translation", activityType: "TRANSLATOR" },
      }),
    ];
    gqlFetch.mockImplementation(
      (doc: unknown, vars?: Record<string, unknown>) =>
        routeGqlFetch(doc, vars, entries, [project], [sheet]),
    );
    const onAdd = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => useTimeEntriesTab(42, onAdd), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.entriesLoading).toBe(false));

    act(() => {
      result.current.toggleEntry(1);
    });

    await act(async () => {
      await result.current.handleBulkAdd();
    });

    expect(onAdd).toHaveBeenCalledWith({
      invoiceId: 42,
      description: "Translate",
      quantity: 1000,
      unitPrice: 0.12,
      projectId: 1,
      timeEntryId: 1,
    });
  });

  it("handleBulkAdd still adds a translation entry missing wordsProcessed, at quantity 0 rather than skipping it", async () => {
    const project = makeProject({ id: 1 });
    const entries = [
      makeEntry({
        id: 1,
        description: "Translate",
        wordsProcessed: null,
        activity: { id: 1, name: "Translation", activityType: "TRANSLATOR" },
      }),
    ];
    gqlFetch.mockImplementation(
      (doc: unknown, vars?: Record<string, unknown>) =>
        routeGqlFetch(doc, vars, entries, [project]),
    );
    const onAdd = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => useTimeEntriesTab(42, onAdd), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.entriesLoading).toBe(false));

    act(() => {
      result.current.toggleEntry(1);
    });

    await act(async () => {
      await result.current.handleBulkAdd();
    });

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ quantity: 0, timeEntryId: 1 }),
    );
  });

  it("handleBulkAdd still adds a non-translation entry missing duration, at quantity 0 rather than skipping it", async () => {
    const entries = [
      makeEntry({ id: 1, description: "Work", durationSeconds: null }),
    ];
    gqlFetch.mockImplementation(
      (doc: unknown, vars?: Record<string, unknown>) =>
        routeGqlFetch(doc, vars, entries, []),
    );
    const onAdd = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => useTimeEntriesTab(42, onAdd), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.entriesLoading).toBe(false));

    act(() => {
      result.current.toggleEntry(1);
    });

    await act(async () => {
      await result.current.handleBulkAdd();
    });

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ quantity: 0, timeEntryId: 1 }),
    );
  });
});
