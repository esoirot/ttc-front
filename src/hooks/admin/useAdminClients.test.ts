import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createQueryClient,
  createQueryWrapper,
} from "@/test/queryClientWrapper";
import type { AdminClient, AdminConnection } from "@/types/admin.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { useAdminClients, useAdminCrudClients } from "./useAdminClients";

function makeAdminClient(overrides: Partial<AdminClient> = {}): AdminClient {
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
    owner: { id: 1, email: "owner@x.com", name: "Owner" },
    ...overrides,
  } as AdminClient;
}

function makeConnection(
  items: AdminClient[],
  nextCursor: number | null = null,
): AdminConnection<AdminClient> {
  return { items, nextCursor, total: items.length };
}

describe("useAdminClients", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("flattens the first page of admin clients", async () => {
    const client = makeAdminClient();
    gqlFetch.mockResolvedValueOnce({ adminClients: makeConnection([client]) });

    const { result } = renderHook(() => useAdminClients(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.clients).toEqual([client]);
  });
});

describe("useAdminCrudClients", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("createClient invalidates the adminClients cache", async () => {
    gqlMutate.mockResolvedValueOnce({
      adminCreateClient: makeAdminClient({ id: 9 }),
    });
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useAdminCrudClients(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.createClient({ userId: 1, name: "New" });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["adminClients"] });
  });

  it("updateClient patches the matching client across cached pages", async () => {
    const updated = makeAdminClient({ id: 3, name: "Renamed" });
    gqlMutate.mockResolvedValueOnce({ adminUpdateClient: updated });
    const queryClient = createQueryClient();
    const queryKey = ["adminClients", { search: null }];
    queryClient.setQueryData(queryKey, {
      pages: [makeConnection([makeAdminClient({ id: 3, name: "Old" })])],
      pageParams: [undefined],
    });

    const { result } = renderHook(() => useAdminCrudClients(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.updateClient({ id: 3, name: "Renamed" });

    const cached = queryClient.getQueryData<{
      pages: AdminConnection<AdminClient>[];
    }>(queryKey);
    expect(cached?.pages[0].items[0].name).toBe("Renamed");
  });

  it("deleteClient removes the client from cached pages and decrements total", async () => {
    gqlMutate.mockResolvedValueOnce({ adminDeleteClient: { id: 2 } });
    const queryClient = createQueryClient();
    const queryKey = ["adminClients", { search: null }];
    queryClient.setQueryData(queryKey, {
      pages: [
        makeConnection([
          makeAdminClient({ id: 1 }),
          makeAdminClient({ id: 2 }),
        ]),
      ],
      pageParams: [undefined],
    });

    const { result } = renderHook(() => useAdminCrudClients(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.deleteClient(2);

    const cached = queryClient.getQueryData<{
      pages: AdminConnection<AdminClient>[];
    }>(queryKey);
    expect(cached?.pages[0].items.map((c) => c.id)).toEqual([1]);
    expect(cached?.pages[0].total).toBe(1);
  });
});
