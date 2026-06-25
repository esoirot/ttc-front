import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryWrapper } from "@/test/queryClientWrapper";
import type { Client } from "@/types/clients.types";
import type { Project } from "@/types/projects.types";
import type { TimeEntry } from "@/types/time-entries.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { useClientDetail } from "./useClientDetail";

function makeClient(overrides: Partial<Client> = {}): Client {
  return {
    id: 1,
    userId: 1,
    name: "Acme",
    legalName: null,
    email: null,
    phone: null,
    company: null,
    address: null,
    city: null,
    country: null,
    postalCode: null,
    vatNumber: null,
    notes: null,
    hubspotId: null,
    clientType: "COMPANY",
    firstName: null,
    lastName: null,
    paymentDelayDays: null,
    taxRate: null,
    billingEndOfMonth: false,
    website: null,
    industry: null,
    tags: [],
    contacts: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as Client;
}

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
    unitPrice: null,
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
    description: null,
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

describe("useClientDetail", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  function routeGqlFetch(vars: Record<string, unknown> = {}) {
    if ("id" in vars && !("pagination" in vars)) {
      return Promise.resolve({ client: makeClient({ id: vars.id as number }) });
    }
    if ("pagination" in vars && "projectId" in vars) {
      const hasProjects =
        Array.isArray(vars.projectIds) && vars.projectIds.length > 0;
      return Promise.resolve({
        timeEntries: {
          items: hasProjects
            ? [
                makeEntry({ id: 1, projectId: 1, durationSeconds: 3600 }),
                makeEntry({ id: 2, projectId: 1, durationSeconds: 1800 }),
              ]
            : [],
          nextCursor: null,
          total: hasProjects ? 2 : 0,
        },
      });
    }
    if ("pagination" in vars && "clientId" in vars) {
      return Promise.resolve({
        invoices: { items: [], nextCursor: null, total: 0 },
      });
    }
    return Promise.resolve({
      projects: {
        items: [
          makeProject({ id: 1, clientId: 1 }),
          makeProject({ id: 2, clientId: 2 }),
        ],
        nextCursor: null,
        total: 2,
      },
    });
  }

  it("filters projects to this client and sums durations across them", async () => {
    gqlFetch.mockImplementation(
      (_doc: unknown, vars?: Record<string, unknown>) => routeGqlFetch(vars),
    );

    const { result } = renderHook(() => useClientDetail(1), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.clientLoading).toBe(false));
    await waitFor(() => expect(result.current.projectsLoading).toBe(false));
    await waitFor(() => expect(result.current.totalSeconds).toBe(5400));

    expect(result.current.clientProjects.map((p) => p.id)).toEqual([1]);
    expect(result.current.clientProjectIds).toEqual([1]);
  });

  it("does not include time entries when the client has no projects", async () => {
    gqlFetch.mockImplementation(
      (_doc: unknown, vars?: Record<string, unknown>) => {
        if (
          "pagination" in (vars ?? {}) &&
          !("projectId" in (vars ?? {})) &&
          !("clientId" in (vars ?? {}))
        ) {
          return Promise.resolve({
            projects: { items: [], nextCursor: null, total: 0 },
          });
        }
        return routeGqlFetch(vars);
      },
    );

    const { result } = renderHook(() => useClientDetail(9), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.projectsLoading).toBe(false));
    expect(result.current.clientProjects).toEqual([]);
    expect(result.current.totalSeconds).toBe(0);
  });
});
