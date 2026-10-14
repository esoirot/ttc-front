import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createQueryClient,
  createQueryWrapper,
} from "@/test/queryClientWrapper";
import type { Client, ClientConnection } from "@/types/clients.types";
import type { InfiniteData } from "@tanstack/react-query";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import {
  useAllClients,
  useClient,
  useCreateCompanyContact,
  useDeleteCompanyContact,
  useUpdateCompanyContact,
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

    renderHook(() => useClients({ search: "acme", clientType: "COMPANY" }), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(gqlFetch).toHaveBeenCalled());
    const vars = gqlFetch.mock.calls[0][1];
    expect(vars.search).toBe("acme");
    expect(vars.clientType).toBe("COMPANY");
  });

  it("passes excludeStatus and status through to the query variables", async () => {
    gqlFetch.mockResolvedValueOnce({ clients: makeConnection([]) });

    renderHook(
      () => useClients({ excludeStatus: "CLIENT", status: "TO_CONTACT" }),
      {
        wrapper: createQueryWrapper(),
      },
    );

    await waitFor(() => expect(gqlFetch).toHaveBeenCalled());
    const vars = gqlFetch.mock.calls[0][1];
    expect(vars.excludeStatus).toBe("CLIENT");
    expect(vars.status).toBe("TO_CONTACT");
  });

  it("passes the industry filter through to the query variables", async () => {
    gqlFetch.mockResolvedValueOnce({ clients: makeConnection([]) });

    renderHook(() => useClients({ industry: "LEGAL" }), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(gqlFetch).toHaveBeenCalled());
    expect(gqlFetch.mock.calls[0][1].industry).toBe("LEGAL");
  });

  it("keeps each industry filter's results in its own cache", async () => {
    gqlFetch
      .mockResolvedValueOnce({
        clients: makeConnection([makeClient({ id: 1, name: "Law firm" })]),
      })
      .mockResolvedValueOnce({
        clients: makeConnection([makeClient({ id: 2, name: "Bank" })]),
      });
    const queryClient = createQueryClient();
    const wrapper = createQueryWrapper(queryClient);

    const { result: legal } = renderHook(
      () => useClients({ industry: "LEGAL" }),
      { wrapper },
    );
    await waitFor(() => expect(legal.current.loading).toBe(false));
    const { result: finance } = renderHook(
      () => useClients({ industry: "FINANCE" }),
      { wrapper },
    );
    await waitFor(() => expect(finance.current.loading).toBe(false));

    expect(legal.current.clients.map((c) => c.name)).toEqual(["Law firm"]);
    expect(finance.current.clients.map((c) => c.name)).toEqual(["Bank"]);
  });

  it("passes the sort through, with its own cache", async () => {
    gqlFetch.mockResolvedValue({ clients: makeConnection([]) });
    const queryClient = createQueryClient();
    const wrapper = createQueryWrapper(queryClient);

    renderHook(
      () => useClients({ sort: { field: "NAME", direction: "DESC" } }),
      { wrapper },
    );
    await waitFor(() => expect(gqlFetch).toHaveBeenCalledTimes(1));
    expect(gqlFetch.mock.calls[0][1].sort).toEqual({
      field: "NAME",
      direction: "DESC",
    });
    renderHook(
      () => useClients({ sort: { field: "NAME", direction: "ASC" } }),
      { wrapper },
    );
    await waitFor(() => expect(gqlFetch).toHaveBeenCalledTimes(2));
  });

  it("uses a custom limit when provided", async () => {
    gqlFetch.mockResolvedValueOnce({ clients: makeConnection([]) });

    renderHook(() => useClients({ limit: 200 }), {
      wrapper: createQueryWrapper(),
    });

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
      () => useClients({ excludeStatus: "CLIENT" }),
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

  const prospects = {
    search: null,
    clientType: null,
    excludeStatus: "CLIENT" as const,
    status: null,
  };
  const companies = {
    search: null,
    clientType: "COMPANY",
    excludeStatus: null,
    status: "CLIENT" as const,
  };

  function seedListCache(
    queryClient: ReturnType<typeof createQueryClient>,
    key: object,
    items: Client[],
  ) {
    queryClient.setQueryData<InfiniteData<ClientConnection>>(["clients", key], {
      pages: [{ items, nextCursor: null, total: items.length }],
      pageParams: [undefined],
    });
  }

  function listItems(
    queryClient: ReturnType<typeof createQueryClient>,
    key: object,
  ) {
    return queryClient.getQueryData<InfiniteData<ClientConnection>>([
      "clients",
      key,
    ])?.pages[0].items;
  }

  async function update(
    queryClient: ReturnType<typeof createQueryClient>,
    updated: Client,
  ) {
    gqlMutate.mockResolvedValueOnce({ updateClient: updated });
    const { result } = renderHook(() => useUpdateClient(), {
      wrapper: createQueryWrapper(queryClient),
    });
    await result.current.updateClient({ id: updated.id });
  }

  it("updates the single-client cache entry on success", async () => {
    const updated = makeClient({ id: 3, name: "Renamed" });
    const queryClient = createQueryClient();

    await update(queryClient, updated);

    expect(queryClient.getQueryData(["client", 3])).toEqual(updated);
  });

  it("shows the saved client at once in every cached list holding it", async () => {
    const other = makeClient({ id: 1, status: "TO_CONTACT" });
    const updated = makeClient({ id: 12, name: "New Name", status: "TALKING" });
    const queryClient = createQueryClient();
    seedListCache(queryClient, prospects, [
      other,
      makeClient({ id: 12, name: "Old Name", status: "TALKING" }),
    ]);

    await update(queryClient, updated);

    expect(listItems(queryClient, prospects)).toEqual([other, updated]);
  });

  it("reloads every cached client list, so the server re-applies its filters and sort", async () => {
    const queryClient = createQueryClient();
    seedListCache(queryClient, prospects, []);
    seedListCache(queryClient, companies, [makeClient({ id: 13 })]);

    await update(
      queryClient,
      makeClient({
        id: 13,
        clientType: "INDIVIDUAL",
        status: "FORMER_CLIENT",
      }),
    );

    expect(
      queryClient.getQueryState(["clients", prospects])?.isInvalidated,
    ).toBe(true);
    expect(
      queryClient.getQueryState(["clients", companies])?.isInvalidated,
    ).toBe(true);
  });

  it("reloads the dashboard, whose prospects to contact copy the client", async () => {
    const queryClient = createQueryClient();
    queryClient.setQueryData(["dashboard"], { prospectsToContact: [] });

    await update(queryClient, makeClient({ id: 14, status: "CONTACTED" }));

    expect(queryClient.getQueryState(["dashboard"])?.isInvalidated).toBe(true);
  });

  it("leaves other caches alone", async () => {
    const queryClient = createQueryClient();
    queryClient.setQueryData(["projects", {}], []);

    await update(queryClient, makeClient({ id: 15 }));

    expect(queryClient.getQueryState(["projects", {}])?.isInvalidated).toBe(
      false,
    );
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

describe("useAllClients", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
  });

  it("loads every client in one large page for dropdowns and lookups", async () => {
    const client = makeClient();
    gqlFetch.mockResolvedValueOnce({ clients: makeConnection([client]) });

    const { result } = renderHook(() => useAllClients(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.clients).toEqual([client]);
    expect(gqlFetch).toHaveBeenCalledWith(expect.anything(), {
      pagination: { limit: 1000 },
    });
  });

  it("does not reuse the paginated 20-item list cache", async () => {
    gqlFetch.mockResolvedValue({ clients: makeConnection([makeClient()]) });
    const wrapper = createQueryWrapper(createQueryClient());

    const list = renderHook(() => useClients(), { wrapper });
    await waitFor(() => expect(list.result.current.loading).toBe(false));
    const all = renderHook(() => useAllClients(), { wrapper });
    await waitFor(() => expect(all.result.current.loading).toBe(false));

    expect(gqlFetch).toHaveBeenCalledTimes(2);
  });

  it("reflects a client edited elsewhere, so dropdowns show the new name", async () => {
    const client = makeClient({ id: 12, name: "Old Name" });
    const updated = makeClient({ id: 12, name: "New Name" });
    gqlFetch.mockResolvedValueOnce({ clients: makeConnection([client]) });
    gqlMutate.mockResolvedValueOnce({ updateClient: updated });
    const wrapper = createQueryWrapper(createQueryClient());

    const all = renderHook(() => useAllClients(), { wrapper });
    await waitFor(() => expect(all.result.current.loading).toBe(false));
    const update = renderHook(() => useUpdateClient(), { wrapper });
    await update.result.current.updateClient({ id: 12, name: "New Name" });

    await waitFor(() => expect(all.result.current.clients).toEqual([updated]));
  });
});

describe("company contact mutations keep the client page in sync", () => {
  const jane = {
    id: 1,
    clientId: 4,
    firstName: "Jane",
    lastName: "Doe",
    email: null,
    phone: null,
    jobTitle: null,
    color: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  function seeded() {
    const queryClient = createQueryClient();
    queryClient.setQueryData(
      ["client", 4],
      makeClient({ id: 4, contacts: [jane] }),
    );
    // Client cards show the first contact's name or a contact count.
    queryClient.setQueryData(["clients", {}], {
      pages: [{ items: [], nextCursor: null, total: 0 }],
      pageParams: [undefined],
    });
    queryClient.setQueryData(["projects", {}], []);
    return queryClient;
  }

  function listStale(queryClient: ReturnType<typeof createQueryClient>) {
    return queryClient.getQueryState(["clients", {}])?.isInvalidated;
  }

  function cachedContacts(queryClient: ReturnType<typeof createQueryClient>) {
    return queryClient.getQueryData<Client>(["client", 4])?.contacts;
  }

  beforeEach(() => gqlMutate.mockReset());

  it("adds a created contact to the cached client", async () => {
    const john = { ...jane, id: 2, firstName: "John" };
    gqlMutate.mockResolvedValueOnce({ createCompanyContact: john });
    const queryClient = seeded();
    const { result } = renderHook(() => useCreateCompanyContact(4), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.createContact({ firstName: "John" });

    expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), {
      input: { firstName: "John", clientId: 4 },
    });
    expect(cachedContacts(queryClient)).toEqual([jane, john]);
    expect(listStale(queryClient)).toBe(true);
  });

  it("replaces an edited contact in the cached client", async () => {
    const renamed = { ...jane, firstName: "Janet" };
    gqlMutate.mockResolvedValueOnce({ updateCompanyContact: renamed });
    const queryClient = seeded();
    const { result } = renderHook(() => useUpdateCompanyContact(4), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.updateContact({ id: 1, firstName: "Janet" });

    expect(cachedContacts(queryClient)).toEqual([renamed]);
    expect(listStale(queryClient)).toBe(true);
    expect(queryClient.getQueryState(["projects", {}])?.isInvalidated).toBe(
      false,
    );
  });

  it("removes a deleted contact from the cached client", async () => {
    gqlMutate.mockResolvedValueOnce({ deleteCompanyContact: true });
    const queryClient = seeded();
    const { result } = renderHook(() => useDeleteCompanyContact(4), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.deleteContact(1);

    expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), { id: 1 });
    expect(cachedContacts(queryClient)).toEqual([]);
    expect(listStale(queryClient)).toBe(true);
  });
});
