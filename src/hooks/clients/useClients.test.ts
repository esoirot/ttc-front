import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createQueryClient,
  createQueryWrapper,
} from "@/test/queryClientWrapper";
import type {
  Client,
  ClientConnection,
  ClientStatus,
} from "@/types/clients.types";
import type { InfiniteData } from "@tanstack/react-query";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import {
  useClient,
  useClients,
  useCreateClient,
  useDeleteClient,
  useUpdateClient,
} from "./useClients";

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
    status: "CLIENT",
    contactedAt: null,
    tags: [],
    contacts: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as Client;
}

function makeConnection(
  items: Client[],
  nextCursor: number | null = null,
): ClientConnection {
  return { items, nextCursor, total: items.length };
}

describe("useClients", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("flattens the first page of clients", async () => {
    const client = makeClient();
    gqlFetch.mockResolvedValueOnce({ clients: makeConnection([client]) });

    const { result } = renderHook(() => useClients(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.clients).toEqual([client]);
    expect(result.current.total).toBe(1);
    expect(result.current.hasMore).toBe(false);
  });

  it("reports hasMore when a nextCursor is present", async () => {
    gqlFetch.mockResolvedValueOnce({
      clients: makeConnection([makeClient()], 99),
    });

    const { result } = renderHook(() => useClients(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.hasMore).toBe(true);
  });

  it("loadMore fetches the next page using the cursor and appends items", async () => {
    const first = makeClient({ id: 1, name: "Acme" });
    const second = makeClient({ id: 2, name: "Beta" });
    gqlFetch
      .mockResolvedValueOnce({ clients: makeConnection([first], 2) })
      .mockResolvedValueOnce({ clients: makeConnection([second], null) });

    const { result } = renderHook(() => useClients(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    result.current.loadMore();

    await waitFor(() => expect(result.current.clients).toHaveLength(2));
    expect(result.current.clients).toEqual([first, second]);

    const secondCallVars = gqlFetch.mock.calls[1][1];
    expect(secondCallVars.pagination).toEqual({ limit: 20, cursor: 2 });
  });

  it("passes search and clientType through to the query variables", async () => {
    gqlFetch.mockResolvedValueOnce({ clients: makeConnection([]) });

    renderHook(() => useClients("acme", "COMPANY"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(gqlFetch).toHaveBeenCalled());
    const vars = gqlFetch.mock.calls[0][1];
    expect(vars.search).toBe("acme");
    expect(vars.clientType).toBe("COMPANY");
  });

  it("passes excludeStatus and status through to the query variables", async () => {
    gqlFetch.mockResolvedValueOnce({ clients: makeConnection([]) });

    renderHook(() => useClients(undefined, undefined, "CLIENT", "TO_CONTACT"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(gqlFetch).toHaveBeenCalled());
    const vars = gqlFetch.mock.calls[0][1];
    expect(vars.excludeStatus).toBe("CLIENT");
    expect(vars.status).toBe("TO_CONTACT");
  });

  it("uses a custom limit when provided", async () => {
    gqlFetch.mockResolvedValueOnce({ clients: makeConnection([]) });

    renderHook(
      () => useClients(undefined, undefined, undefined, undefined, 200),
      { wrapper: createQueryWrapper() },
    );

    await waitFor(() => expect(gqlFetch).toHaveBeenCalled());
    const vars = gqlFetch.mock.calls[0][1];
    expect(vars.pagination).toEqual({ limit: 200 });
  });

  it("keeps excludeStatus/status caches separate from the unfiltered list", async () => {
    gqlFetch
      .mockResolvedValueOnce({
        clients: makeConnection([makeClient({ id: 1, name: "All" })]),
      })
      .mockResolvedValueOnce({
        clients: makeConnection([makeClient({ id: 2, name: "Prospect" })]),
      });
    const queryClient = createQueryClient();

    const { result: all } = renderHook(() => useClients(), {
      wrapper: createQueryWrapper(queryClient),
    });
    const { result: prospects } = renderHook(
      () => useClients(undefined, undefined, "CLIENT"),
      { wrapper: createQueryWrapper(queryClient) },
    );

    await waitFor(() => expect(all.current.loading).toBe(false));
    await waitFor(() => expect(prospects.current.loading).toBe(false));

    expect(all.current.clients.map((c) => c.name)).toEqual(["All"]);
    expect(prospects.current.clients.map((c) => c.name)).toEqual(["Prospect"]);
  });
});

describe("useClient", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("fetches a single client by id", async () => {
    const client = makeClient({ id: 7 });
    gqlFetch.mockResolvedValueOnce({ client });

    const { result } = renderHook(() => useClient(7), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.client).toEqual(client);
    expect(gqlFetch.mock.calls[0][1]).toEqual({ id: 7 });
  });
});

describe("useCreateClient", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("creates a client and invalidates the clients list", async () => {
    const created = makeClient({ id: 5, name: "New Co" });
    gqlMutate.mockResolvedValueOnce({ createClient: created });
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateClient(), {
      wrapper: createQueryWrapper(queryClient),
    });

    const created_ = await result.current.createClient({
      clientType: "COMPANY",
      name: "New Co",
    });

    expect(created_).toEqual(created);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["clients"] });
  });
});

describe("useUpdateClient", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("updates the single-client cache entry on success", async () => {
    const updated = makeClient({ id: 3, name: "Renamed" });
    gqlMutate.mockResolvedValueOnce({ updateClient: updated });
    const queryClient = createQueryClient();

    const { result } = renderHook(() => useUpdateClient(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.updateClient({ id: 3, name: "Renamed" });

    expect(queryClient.getQueryData(["client", 3])).toEqual(updated);
  });

  function seedListCache(
    queryClient: ReturnType<typeof createQueryClient>,
    key: {
      search: string | null;
      clientType: string | null;
      excludeStatus: ClientStatus | null;
      status: ClientStatus | null;
    },
    items: Client[],
  ) {
    queryClient.setQueryData<InfiniteData<ClientConnection>>(["clients", key], {
      pages: [{ items, nextCursor: null, total: items.length }],
      pageParams: [undefined],
    });
  }

  it("removes the item from a status-filtered list cache when its new status no longer matches", async () => {
    const client = makeClient({ id: 10, status: "TO_CONTACT" });
    const updated = makeClient({ id: 10, status: "CONTACTED" });
    gqlMutate.mockResolvedValueOnce({ updateClient: updated });
    const queryClient = createQueryClient();
    seedListCache(
      queryClient,
      {
        search: null,
        clientType: null,
        excludeStatus: null,
        status: "TO_CONTACT",
      },
      [client],
    );

    const { result } = renderHook(() => useUpdateClient(), {
      wrapper: createQueryWrapper(queryClient),
    });
    await result.current.updateClient({ id: 10, status: "CONTACTED" });

    const cache = queryClient.getQueryData<InfiniteData<ClientConnection>>([
      "clients",
      {
        search: null,
        clientType: null,
        excludeStatus: null,
        status: "TO_CONTACT",
      },
    ]);
    expect(cache?.pages[0].items).toEqual([]);
  });

  it("removes the item from an excludeStatus-filtered list cache when its new status now matches the excluded value", async () => {
    const client = makeClient({ id: 11, status: "TALKING" });
    const updated = makeClient({ id: 11, status: "CLIENT" });
    gqlMutate.mockResolvedValueOnce({ updateClient: updated });
    const queryClient = createQueryClient();
    seedListCache(
      queryClient,
      { search: null, clientType: null, excludeStatus: "CLIENT", status: null },
      [client],
    );

    const { result } = renderHook(() => useUpdateClient(), {
      wrapper: createQueryWrapper(queryClient),
    });
    await result.current.updateClient({ id: 11, status: "CLIENT" });

    const cache = queryClient.getQueryData<InfiniteData<ClientConnection>>([
      "clients",
      { search: null, clientType: null, excludeStatus: "CLIENT", status: null },
    ]);
    expect(cache?.pages[0].items).toEqual([]);
  });

  it("updates the item in place in a filtered list cache when it still matches the filter", async () => {
    const client = makeClient({ id: 12, name: "Old Name", status: "TALKING" });
    const updated = makeClient({ id: 12, name: "New Name", status: "TALKING" });
    gqlMutate.mockResolvedValueOnce({ updateClient: updated });
    const queryClient = createQueryClient();
    seedListCache(
      queryClient,
      { search: null, clientType: null, excludeStatus: "CLIENT", status: null },
      [client],
    );

    const { result } = renderHook(() => useUpdateClient(), {
      wrapper: createQueryWrapper(queryClient),
    });
    await result.current.updateClient({ id: 12, name: "New Name" });

    const cache = queryClient.getQueryData<InfiniteData<ClientConnection>>([
      "clients",
      { search: null, clientType: null, excludeStatus: "CLIENT", status: null },
    ]);
    expect(cache?.pages[0].items).toEqual([updated]);
  });
});

describe("useDeleteClient", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("removes the single-client cache entry on success", async () => {
    gqlMutate.mockResolvedValueOnce({ deleteClient: true });
    const queryClient = createQueryClient();
    queryClient.setQueryData(["client", 4], makeClient({ id: 4 }));

    const { result } = renderHook(() => useDeleteClient(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.deleteClient(4);

    expect(queryClient.getQueryData(["client", 4])).toBeUndefined();
  });
});
