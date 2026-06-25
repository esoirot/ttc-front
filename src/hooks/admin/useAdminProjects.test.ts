import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createQueryClient,
  createQueryWrapper,
} from "@/test/queryClientWrapper";
import type { AdminConnection, AdminProject } from "@/types/admin.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { useAdminCrudProjects, useAdminProjects } from "./useAdminProjects";

function makeAdminProject(overrides: Partial<AdminProject> = {}): AdminProject {
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
    owner: { id: 1, email: "owner@x.com", name: "Owner" },
    ...overrides,
  } as AdminProject;
}

function makeConnection(items: AdminProject[]): AdminConnection<AdminProject> {
  return { items, nextCursor: null, total: items.length };
}

describe("useAdminProjects", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("flattens the first page", async () => {
    const project = makeAdminProject();
    gqlFetch.mockResolvedValueOnce({
      adminProjects: makeConnection([project]),
    });

    const { result } = renderHook(() => useAdminProjects(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.projects).toEqual([project]);
  });
});

describe("useAdminCrudProjects", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("createProject invalidates the adminProjects cache", async () => {
    gqlMutate.mockResolvedValueOnce({
      adminCreateProject: makeAdminProject({ id: 9 }),
    });
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useAdminCrudProjects(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.createProject({ userId: 1, title: "New" });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["adminProjects"] });
  });

  it("deleteProject removes the project from cached pages and decrements total", async () => {
    gqlMutate.mockResolvedValueOnce({ adminDeleteProject: { id: 2 } });
    const queryClient = createQueryClient();
    const queryKey = ["adminProjects", { status: null, search: null }];
    queryClient.setQueryData(queryKey, {
      pages: [
        makeConnection([
          makeAdminProject({ id: 1 }),
          makeAdminProject({ id: 2 }),
        ]),
      ],
      pageParams: [undefined],
    });

    const { result } = renderHook(() => useAdminCrudProjects(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.deleteProject(2);

    const cached = queryClient.getQueryData<{
      pages: AdminConnection<AdminProject>[];
    }>(queryKey);
    expect(cached?.pages[0].items.map((p) => p.id)).toEqual([1]);
    expect(cached?.pages[0].total).toBe(1);
  });
});
