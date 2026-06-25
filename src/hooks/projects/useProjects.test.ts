import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createQueryClient,
  createQueryWrapper,
} from "@/test/queryClientWrapper";
import type { Project, ProjectConnection } from "@/types/projects.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import {
  useCreateProject,
  useDeleteProject,
  useProject,
  useProjects,
  useUpdateProject,
} from "./useProjects";

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 1,
    userId: 1,
    clientId: null,
    title: "Translate manual",
    description: null,
    status: "ACTIVE",
    sourceLanguage: "EN",
    targetLanguage: "FR",
    wordCount: 1000,
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

function makeConnection(
  items: Project[],
  nextCursor: number | null = null,
): ProjectConnection {
  return { items, nextCursor, total: items.length };
}

describe("useProjects", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("flattens the first page", async () => {
    const project = makeProject();
    gqlFetch.mockResolvedValueOnce({ projects: makeConnection([project]) });

    const { result } = renderHook(() => useProjects(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.projects).toEqual([project]);
    expect(result.current.hasMore).toBe(false);
  });

  it("loadMore appends the next page using the cursor", async () => {
    const first = makeProject({ id: 1 });
    const second = makeProject({ id: 2 });
    gqlFetch
      .mockResolvedValueOnce({ projects: makeConnection([first], 2) })
      .mockResolvedValueOnce({ projects: makeConnection([second], null) });

    const { result } = renderHook(() => useProjects(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    result.current.loadMore();

    await waitFor(() => expect(result.current.projects).toHaveLength(2));
    const secondVars = gqlFetch.mock.calls[1][1];
    expect(secondVars.pagination).toEqual({ limit: 20, cursor: 2 });
  });

  it("passes status and search through to query variables", async () => {
    gqlFetch.mockResolvedValueOnce({ projects: makeConnection([]) });

    renderHook(() => useProjects("ACTIVE", "manual"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(gqlFetch).toHaveBeenCalled());
    const vars = gqlFetch.mock.calls[0][1];
    expect(vars.status).toBe("ACTIVE");
    expect(vars.search).toBe("manual");
  });
});

describe("useProject", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("fetches a single project by id", async () => {
    const project = makeProject({ id: 9 });
    gqlFetch.mockResolvedValueOnce({ project });

    const { result } = renderHook(() => useProject(9), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.project).toEqual(project);
  });
});

describe("useCreateProject", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("invalidates the projects list on success", async () => {
    const created = makeProject({ id: 5 });
    gqlMutate.mockResolvedValueOnce({ createProject: created });
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateProject(), {
      wrapper: createQueryWrapper(queryClient),
    });

    const res = await result.current.createProject({ title: "New" });

    expect(res).toEqual(created);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["projects"] });
  });
});

describe("useUpdateProject", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("writes the updated project into the single-project cache", async () => {
    const updated = makeProject({ id: 3, title: "Renamed" });
    gqlMutate.mockResolvedValueOnce({ updateProject: updated });
    const queryClient = createQueryClient();

    const { result } = renderHook(() => useUpdateProject(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.updateProject({ id: 3, title: "Renamed" });

    expect(queryClient.getQueryData(["project", 3])).toEqual(updated);
  });
});

describe("useDeleteProject", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("removes the single-project cache entry on success", async () => {
    gqlMutate.mockResolvedValueOnce({ deleteProject: true });
    const queryClient = createQueryClient();
    queryClient.setQueryData(["project", 4], makeProject({ id: 4 }));

    const { result } = renderHook(() => useDeleteProject(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.deleteProject(4);

    expect(queryClient.getQueryData(["project", 4])).toBeUndefined();
  });
});
