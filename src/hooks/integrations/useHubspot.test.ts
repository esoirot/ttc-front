import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createQueryClient,
  createQueryWrapper,
} from "@/test/queryClientWrapper";

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
  useAuditLog,
  useCreateCompany,
  useCreateContact,
  useCreateDeal,
  useDisconnectHubspot,
  useForceDisconnectHubspot,
  useHubspotAdminConnections,
  useHubspotCompanies,
  useHubspotDeals,
  useHubspotContacts,
  useHubspotStatus,
  useImportHubspotContact,
  useInfiniteHubspotCompanies,
  useInfiniteHubspotContacts,
  useInfiniteHubspotDeals,
  useSearchHubspotCompanies,
  useSearchHubspotContacts,
  useSearchHubspotDeals,
  useUpdateCompany,
  useUpdateContact,
  useUpdateDeal,
} from "./useHubspot";

describe("useHubspotStatus", () => {
  beforeEach(() => {
    apiGet.mockReset();
    apiPost.mockReset();
    apiPatch.mockReset();
    apiDelete.mockReset();
  });

  it("fetches connection status", async () => {
    apiGet.mockResolvedValueOnce({ connected: true, portalId: "123" });

    const { result } = renderHook(() => useHubspotStatus(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual({ connected: true, portalId: "123" });
  });
});

describe("useDisconnectHubspot", () => {
  beforeEach(() => {
    apiDelete.mockReset();
  });

  it("disconnects and invalidates hubspot queries", async () => {
    apiDelete.mockResolvedValueOnce(undefined);
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDisconnectHubspot(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.mutateAsync();

    expect(apiDelete).toHaveBeenCalledWith("/hubspot/disconnect");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["hubspot"] });
  });
});

describe("useCreateContact", () => {
  beforeEach(() => {
    apiPost.mockReset();
  });

  it("posts a new contact and invalidates the contacts list", async () => {
    apiPost.mockResolvedValueOnce({ id: "c1", email: "a@b.com" });
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateContact(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.mutateAsync({ email: "a@b.com" });

    expect(apiPost).toHaveBeenCalledWith("/hubspot/contacts", {
      email: "a@b.com",
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["hubspot", "contacts"],
    });
  });
});

describe("useInfiniteHubspotContacts", () => {
  beforeEach(() => {
    apiGet.mockReset();
  });

  it("fetches the first page without an after cursor", async () => {
    apiGet.mockResolvedValueOnce({ results: [{ id: "c1" }] });

    const { result } = renderHook(() => useInfiniteHubspotContacts(20), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(apiGet).toHaveBeenCalledWith("/hubspot/contacts?limit=20");
  });

  it("exposes hasNextPage when paging.next is present", async () => {
    apiGet.mockResolvedValueOnce({
      results: [{ id: "c1" }],
      paging: { next: { after: "cursor-1" } },
    });

    const { result } = renderHook(() => useInfiniteHubspotContacts(20), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.hasNextPage).toBe(true));
  });

  it("fetchNextPage requests the next page using the after cursor", async () => {
    apiGet
      .mockResolvedValueOnce({
        results: [{ id: "c1" }],
        paging: { next: { after: "cursor-1" } },
      })
      .mockResolvedValueOnce({ results: [{ id: "c2" }] });

    const { result } = renderHook(() => useInfiniteHubspotContacts(20), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.hasNextPage).toBe(true));
    await result.current.fetchNextPage();

    expect(apiGet).toHaveBeenLastCalledWith(
      "/hubspot/contacts?limit=20&after=cursor-1",
    );
  });
});

describe("useSearchHubspotContacts", () => {
  beforeEach(() => {
    apiPost.mockReset();
  });

  it("is disabled for an empty/whitespace query", () => {
    renderHook(() => useSearchHubspotContacts("   "), {
      wrapper: createQueryWrapper(),
    });

    expect(apiPost).not.toHaveBeenCalled();
  });

  it("searches via POST when the query is non-empty", async () => {
    apiPost.mockResolvedValueOnce({ results: [] });

    const { result } = renderHook(() => useSearchHubspotContacts("jane"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(apiPost).toHaveBeenCalledWith(
      "/hubspot/contacts/search",
      expect.anything(),
    );
  });
});

describe("useUpdateContact", () => {
  beforeEach(() => {
    apiPatch.mockReset();
  });

  it("patches the contact by id, stripping id from the body", async () => {
    apiPatch.mockResolvedValueOnce({ id: "c1", email: "new@x.com" });
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateContact(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.mutateAsync({ id: "c1", email: "new@x.com" });

    expect(apiPatch).toHaveBeenCalledWith("/hubspot/contacts/c1", {
      email: "new@x.com",
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["hubspot", "contacts"],
    });
  });
});

describe("useCreateDeal", () => {
  beforeEach(() => {
    apiPost.mockReset();
  });

  it("posts a new deal and invalidates the deals list", async () => {
    apiPost.mockResolvedValueOnce({ id: "d1" });
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateDeal(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.mutateAsync({ dealname: "New deal" } as never);

    expect(apiPost).toHaveBeenCalledWith("/hubspot/deals", {
      dealname: "New deal",
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["hubspot", "deals"],
    });
  });
});

describe("useAuditLog", () => {
  beforeEach(() => {
    apiGet.mockReset();
  });

  it("includes userId and limit in the query string when provided", async () => {
    apiGet.mockResolvedValueOnce({ items: [], nextCursor: null });

    renderHook(() => useAuditLog(7, 10), { wrapper: createQueryWrapper() });

    await waitFor(() =>
      expect(apiGet).toHaveBeenCalledWith("/admin/audit?userId=7&limit=10"),
    );
  });

  it("fetchNextPage requests the next page using the returned cursor", async () => {
    apiGet
      .mockResolvedValueOnce({ items: [{ id: 1 }], nextCursor: 5 })
      .mockResolvedValueOnce({ items: [{ id: 2 }], nextCursor: null });

    const { result } = renderHook(() => useAuditLog(undefined, 50), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.hasNextPage).toBe(true));
    await result.current.fetchNextPage();

    expect(apiGet).toHaveBeenLastCalledWith("/admin/audit?limit=50&cursor=5");
  });
});

describe("useHubspotAdminConnections", () => {
  beforeEach(() => {
    apiGet.mockReset();
  });

  it("fetches all users' hubspot connection status", async () => {
    apiGet.mockResolvedValueOnce([{ userId: 1, connected: true }]);

    const { result } = renderHook(() => useHubspotAdminConnections(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(apiGet).toHaveBeenCalledWith("/hubspot/admin/connections");
    expect(result.current.data).toEqual([{ userId: 1, connected: true }]);
  });
});

describe("useForceDisconnectHubspot", () => {
  beforeEach(() => {
    apiDelete.mockReset();
  });

  it("force-disconnects a user and invalidates admin connections", async () => {
    apiDelete.mockResolvedValueOnce(undefined);
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useForceDisconnectHubspot(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.mutateAsync(9);

    expect(apiDelete).toHaveBeenCalledWith("/hubspot/admin/connections/9");
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["admin", "hubspot", "connections"],
    });
  });
});

describe("useImportHubspotContact", () => {
  beforeEach(() => {
    apiPost.mockReset();
  });

  it("imports a contact and invalidates the clients cache", async () => {
    apiPost.mockResolvedValueOnce({ id: 1, name: "Acme" });
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useImportHubspotContact(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.mutateAsync("c1");

    expect(apiPost).toHaveBeenCalledWith("/hubspot/contacts/c1/import-client");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["clients"] });
  });
});

describe("useHubspotContacts", () => {
  beforeEach(() => {
    apiGet.mockReset();
  });

  it("fetches without query params when after/limit are omitted", async () => {
    apiGet.mockResolvedValueOnce({ results: [] });

    const { result } = renderHook(() => useHubspotContacts(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(apiGet).toHaveBeenCalledWith("/hubspot/contacts");
  });

  it("includes after and limit in the query string when provided", async () => {
    apiGet.mockResolvedValueOnce({ results: [] });

    renderHook(() => useHubspotContacts("cursor-1", 10), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() =>
      expect(apiGet).toHaveBeenCalledWith(
        "/hubspot/contacts?after=cursor-1&limit=10",
      ),
    );
  });
});

describe("useHubspotCompanies", () => {
  beforeEach(() => {
    apiGet.mockReset();
  });

  it("fetches companies with the given after/limit", async () => {
    apiGet.mockResolvedValueOnce({ results: [{ id: "co1" }] });

    const { result } = renderHook(() => useHubspotCompanies("cursor-2", 5), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(apiGet).toHaveBeenCalledWith(
      "/hubspot/companies?after=cursor-2&limit=5",
    );
    expect(result.current.data).toEqual({ results: [{ id: "co1" }] });
  });
});

describe("useHubspotDeals", () => {
  beforeEach(() => {
    apiGet.mockReset();
  });

  it("fetches deals without query params when after/limit are omitted", async () => {
    apiGet.mockResolvedValueOnce({ results: [] });

    renderHook(() => useHubspotDeals(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(apiGet).toHaveBeenCalledWith("/hubspot/deals"));
  });
});

describe("useUpdateDeal", () => {
  beforeEach(() => {
    apiPatch.mockReset();
  });

  it("patches the deal by id, stripping id from the body", async () => {
    apiPatch.mockResolvedValueOnce({ id: "d1", dealname: "Renamed" });
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateDeal(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.mutateAsync({
      id: "d1",
      dealname: "Renamed",
    } as never);

    expect(apiPatch).toHaveBeenCalledWith("/hubspot/deals/d1", {
      dealname: "Renamed",
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["hubspot", "deals"],
    });
  });
});

describe("useInfiniteHubspotCompanies", () => {
  beforeEach(() => {
    apiGet.mockReset();
  });

  it("fetches the first page and exposes hasNextPage", async () => {
    apiGet.mockResolvedValueOnce({
      results: [{ id: "co1" }],
      paging: { next: { after: "cursor-1" } },
    });

    const { result } = renderHook(() => useInfiniteHubspotCompanies(20), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.hasNextPage).toBe(true));
    expect(apiGet).toHaveBeenCalledWith("/hubspot/companies?limit=20");
  });

  it("fetchNextPage requests the next page using the after cursor", async () => {
    apiGet
      .mockResolvedValueOnce({
        results: [{ id: "co1" }],
        paging: { next: { after: "cursor-1" } },
      })
      .mockResolvedValueOnce({ results: [{ id: "co2" }] });

    const { result } = renderHook(() => useInfiniteHubspotCompanies(20), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.hasNextPage).toBe(true));
    await result.current.fetchNextPage();

    expect(apiGet).toHaveBeenLastCalledWith(
      "/hubspot/companies?limit=20&after=cursor-1",
    );
  });
});

describe("useInfiniteHubspotDeals", () => {
  beforeEach(() => {
    apiGet.mockReset();
  });

  it("fetches the first page without an after cursor", async () => {
    apiGet.mockResolvedValueOnce({ results: [{ id: "d1" }] });

    renderHook(() => useInfiniteHubspotDeals(20), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() =>
      expect(apiGet).toHaveBeenCalledWith("/hubspot/deals?limit=20"),
    );
  });
});

describe("useCreateCompany", () => {
  beforeEach(() => {
    apiPost.mockReset();
  });

  it("posts a new company and invalidates the companies list", async () => {
    apiPost.mockResolvedValueOnce({ id: "co1" });
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateCompany(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.mutateAsync({ name: "Acme" } as never);

    expect(apiPost).toHaveBeenCalledWith("/hubspot/companies", {
      name: "Acme",
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["hubspot", "companies"],
    });
  });
});

describe("useUpdateCompany", () => {
  beforeEach(() => {
    apiPatch.mockReset();
  });

  it("patches the company by id, stripping id from the body", async () => {
    apiPatch.mockResolvedValueOnce({ id: "co1", name: "Renamed" });
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateCompany(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.mutateAsync({
      id: "co1",
      name: "Renamed",
    } as never);

    expect(apiPatch).toHaveBeenCalledWith("/hubspot/companies/co1", {
      name: "Renamed",
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["hubspot", "companies"],
    });
  });
});

describe("useSearchHubspotCompanies", () => {
  beforeEach(() => {
    apiPost.mockReset();
  });

  it("is disabled for an empty/whitespace query", () => {
    renderHook(() => useSearchHubspotCompanies("   "), {
      wrapper: createQueryWrapper(),
    });

    expect(apiPost).not.toHaveBeenCalled();
  });

  it("searches via POST when the query is non-empty", async () => {
    apiPost.mockResolvedValueOnce({ results: [] });

    const { result } = renderHook(() => useSearchHubspotCompanies("acme"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(apiPost).toHaveBeenCalledWith(
      "/hubspot/companies/search",
      expect.anything(),
    );
  });
});

describe("useSearchHubspotDeals", () => {
  beforeEach(() => {
    apiPost.mockReset();
  });

  it("is disabled for an empty/whitespace query", () => {
    renderHook(() => useSearchHubspotDeals("   "), {
      wrapper: createQueryWrapper(),
    });

    expect(apiPost).not.toHaveBeenCalled();
  });

  it("searches via POST when the query is non-empty", async () => {
    apiPost.mockResolvedValueOnce({ results: [] });

    const { result } = renderHook(() => useSearchHubspotDeals("deal"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(apiPost).toHaveBeenCalledWith(
      "/hubspot/deals/search",
      expect.anything(),
    );
  });
});
