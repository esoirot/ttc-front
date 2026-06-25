import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createQueryClient,
  createQueryWrapper,
} from "@/test/queryClientWrapper";
import { ApiError } from "@/lib/api";

const { apiGet, apiPost, apiPatch, apiDelete } = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPatch: vi.fn(),
  apiDelete: vi.fn(),
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return { ...actual, apiGet, apiPost, apiPatch, apiDelete };
});

import {
  useClockifyActiveEntry,
  useClockifyEntries,
  useClockifyProjects,
  useClockifyStatus,
  useClockifyTags,
  useClockifyWorkspaces,
  useCreateTag,
  useDeleteEntry,
  useDisconnectClockify,
  useImportClockifyEntries,
  useSetClockifyCredentials,
  useSetClockifyWorkspace,
  useStartEntry,
  useStopEntry,
  useUpdateEntry,
} from "./useClockify";

describe("useClockifyStatus", () => {
  beforeEach(() => {
    apiGet.mockReset();
    apiPost.mockReset();
    apiPatch.mockReset();
    apiDelete.mockReset();
  });

  it("fetches connection status via REST", async () => {
    apiGet.mockResolvedValueOnce({ connected: true, workspaceId: "w1" });

    const { result } = renderHook(() => useClockifyStatus(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual({ connected: true, workspaceId: "w1" });
    expect(apiGet).toHaveBeenCalledWith("/clockify/status");
  });
});

describe("useClockifyWorkspaces", () => {
  beforeEach(() => {
    apiGet.mockReset();
  });

  it("does not fetch when disabled", () => {
    renderHook(() => useClockifyWorkspaces(false), {
      wrapper: createQueryWrapper(),
    });

    expect(apiGet).not.toHaveBeenCalled();
  });

  it("fetches workspaces when enabled", async () => {
    apiGet.mockResolvedValueOnce([
      { id: "w1", name: "Acme", imageUrl: "", featureSubscriptionType: "PRO" },
    ]);

    const { result } = renderHook(() => useClockifyWorkspaces(true), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toHaveLength(1);
  });
});

describe("useClockifyActiveEntry", () => {
  beforeEach(() => {
    apiGet.mockReset();
  });

  it("does not poll when there is no workspace", () => {
    renderHook(() => useClockifyActiveEntry(null), {
      wrapper: createQueryWrapper(),
    });

    expect(apiGet).not.toHaveBeenCalled();
  });

  it("fetches the active entry for a workspace", async () => {
    apiGet.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useClockifyActiveEntry("w1"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeNull();
    expect(apiGet).toHaveBeenCalledWith(
      "/clockify/workspaces/w1/entries/active",
    );
  });
});

describe("useSetClockifyCredentials", () => {
  beforeEach(() => {
    apiPost.mockReset();
  });

  it("posts credentials and invalidates clockify queries", async () => {
    apiPost.mockResolvedValueOnce(undefined);
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useSetClockifyCredentials(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.mutateAsync({ apiKey: "key123" });

    expect(apiPost).toHaveBeenCalledWith("/clockify/credentials", {
      apiKey: "key123",
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["clockify"] });
  });
});

describe("useDisconnectClockify", () => {
  beforeEach(() => {
    apiDelete.mockReset();
  });

  it("deletes credentials and invalidates clockify queries", async () => {
    apiDelete.mockResolvedValueOnce(undefined);
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDisconnectClockify(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.mutateAsync();

    expect(apiDelete).toHaveBeenCalledWith("/clockify/credentials");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["clockify"] });
  });
});

describe("useStartEntry", () => {
  beforeEach(() => {
    apiPost.mockReset();
  });

  it("posts the new entry to the workspace and invalidates active/entries", async () => {
    apiPost.mockResolvedValueOnce({ id: "e1" });
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useStartEntry("w1"), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.mutateAsync({ description: "Work" });

    expect(apiPost).toHaveBeenCalledWith("/clockify/workspaces/w1/entries", {
      description: "Work",
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["clockify", "active", "w1"],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["clockify", "entries", "w1"],
    });
  });
});

describe("useDeleteEntry", () => {
  beforeEach(() => {
    apiDelete.mockReset();
  });

  it("deletes the entry by id under the workspace", async () => {
    apiDelete.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteEntry("w1"), {
      wrapper: createQueryWrapper(),
    });

    await result.current.mutateAsync("e1");

    expect(apiDelete).toHaveBeenCalledWith(
      "/clockify/workspaces/w1/entries/e1",
    );
  });
});

describe("useClockifyProjects", () => {
  beforeEach(() => {
    apiGet.mockReset();
  });

  it("does not fetch without a workspace", () => {
    renderHook(() => useClockifyProjects(null), {
      wrapper: createQueryWrapper(),
    });
    expect(apiGet).not.toHaveBeenCalled();
  });

  it("fetches projects for the given workspace", async () => {
    apiGet.mockResolvedValueOnce([]);

    renderHook(() => useClockifyProjects("w1"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() =>
      expect(apiGet).toHaveBeenCalledWith("/clockify/workspaces/w1/projects"),
    );
  });
});

describe("useClockifyEntries", () => {
  beforeEach(() => {
    apiGet.mockReset();
  });

  it("builds the query string from start/end when provided", async () => {
    apiGet.mockResolvedValueOnce([]);

    renderHook(() => useClockifyEntries("w1", "2026-06-01", "2026-06-30"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() =>
      expect(apiGet).toHaveBeenCalledWith(
        "/clockify/workspaces/w1/entries?start=2026-06-01&end=2026-06-30",
      ),
    );
  });

  it("omits the query string when no range is given", async () => {
    apiGet.mockResolvedValueOnce([]);

    renderHook(() => useClockifyEntries("w1"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() =>
      expect(apiGet).toHaveBeenCalledWith("/clockify/workspaces/w1/entries"),
    );
  });
});

describe("useClockifyTags", () => {
  beforeEach(() => {
    apiGet.mockReset();
  });

  it("fetches tags scoped to the workspace", async () => {
    apiGet.mockResolvedValueOnce([{ id: "t1", name: "Urgent" }]);

    const { result } = renderHook(() => useClockifyTags("w1"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toHaveLength(1);
  });
});

describe("useCreateTag", () => {
  beforeEach(() => {
    apiPost.mockReset();
  });

  it("posts the new tag and invalidates the tags query", async () => {
    apiPost.mockResolvedValueOnce({ id: "t2", name: "Billable" });
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateTag("w1"), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.mutateAsync("Billable");

    expect(apiPost).toHaveBeenCalledWith("/clockify/workspaces/w1/tags", {
      name: "Billable",
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["clockify", "tags", "w1"],
    });
  });
});

describe("useSetClockifyWorkspace", () => {
  beforeEach(() => {
    apiPatch.mockReset();
  });

  it("patches the workspace preference and invalidates status", async () => {
    apiPatch.mockResolvedValueOnce(undefined);
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useSetClockifyWorkspace(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.mutateAsync("w2");

    expect(apiPatch).toHaveBeenCalledWith("/clockify/workspace", {
      workspaceId: "w2",
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["clockify", "status"],
    });
  });
});

describe("useStopEntry", () => {
  beforeEach(() => {
    apiPatch.mockReset();
  });

  it("stops the running entry and invalidates active/entries", async () => {
    apiPatch.mockResolvedValueOnce({ id: "e1" });
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useStopEntry("w1"), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.mutateAsync();

    expect(apiPatch).toHaveBeenCalledWith(
      "/clockify/workspaces/w1/entries/stop",
    );
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["clockify", "active", "w1"],
    });
  });
});

describe("useUpdateEntry", () => {
  beforeEach(() => {
    apiPatch.mockReset();
  });

  it("patches the entry by id, stripping entryId from the body", async () => {
    apiPatch.mockResolvedValueOnce({ id: "e1" });

    const { result } = renderHook(() => useUpdateEntry("w1"), {
      wrapper: createQueryWrapper(),
    });

    await result.current.mutateAsync({
      entryId: "e1",
      start: "2026-06-17T09:00:00.000Z",
      billable: true,
      tagIds: [],
    });

    expect(apiPatch).toHaveBeenCalledWith(
      "/clockify/workspaces/w1/entries/e1",
      { start: "2026-06-17T09:00:00.000Z", billable: true, tagIds: [] },
    );
  });
});

describe("useImportClockifyEntries", () => {
  beforeEach(() => {
    apiPost.mockReset();
  });

  it("posts the date range and returns import counts", async () => {
    apiPost.mockResolvedValueOnce({ imported: 3, skipped: 1 });

    const { result } = renderHook(() => useImportClockifyEntries("w1"), {
      wrapper: createQueryWrapper(),
    });

    const res = await result.current.mutateAsync({
      start: "2026-06-01",
      end: "2026-06-30",
    });

    expect(res).toEqual({ imported: 3, skipped: 1 });
    expect(apiPost).toHaveBeenCalledWith(
      "/clockify/workspaces/w1/entries/import",
      { start: "2026-06-01", end: "2026-06-30" },
    );
  });
});

describe("ApiError import sanity", () => {
  it("ApiError is still the real class from the actual module", () => {
    const err = new ApiError(401, "nope");
    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(401);
  });
});
