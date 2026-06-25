import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createQueryClient,
  createQueryWrapper,
} from "@/test/queryClientWrapper";
import type { AdminConnection, AdminInvoice } from "@/types/admin.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { useAdminCrudInvoices, useAdminInvoices } from "./useAdminInvoices";

function makeAdminInvoice(overrides: Partial<AdminInvoice> = {}): AdminInvoice {
  return {
    id: 1,
    userId: 1,
    clientId: null,
    number: "INV-0001",
    status: "DRAFT",
    currency: "EUR",
    issuedAt: null,
    dueDate: null,
    paidAt: null,
    notes: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    items: [],
    owner: { id: 1, email: "owner@x.com", name: "Owner" },
    ...overrides,
  } as AdminInvoice;
}

function makeConnection(items: AdminInvoice[]): AdminConnection<AdminInvoice> {
  return { items, nextCursor: null, total: items.length };
}

describe("useAdminInvoices", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("flattens the first page", async () => {
    const invoice = makeAdminInvoice();
    gqlFetch.mockResolvedValueOnce({
      adminInvoices: makeConnection([invoice]),
    });

    const { result } = renderHook(() => useAdminInvoices(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.invoices).toEqual([invoice]);
  });
});

describe("useAdminCrudInvoices", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("updateInvoice patches the matching invoice across cached pages", async () => {
    const updated = makeAdminInvoice({ id: 3, status: "SENT" });
    gqlMutate.mockResolvedValueOnce({ adminUpdateInvoice: updated });
    const queryClient = createQueryClient();
    const queryKey = ["adminInvoices", { status: null, search: null }];
    queryClient.setQueryData(queryKey, {
      pages: [makeConnection([makeAdminInvoice({ id: 3, status: "DRAFT" })])],
      pageParams: [undefined],
    });

    const { result } = renderHook(() => useAdminCrudInvoices(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.updateInvoice({ id: 3, status: "SENT" });

    const cached = queryClient.getQueryData<{
      pages: AdminConnection<AdminInvoice>[];
    }>(queryKey);
    expect(cached?.pages[0].items[0].status).toBe("SENT");
  });

  it("deleteInvoice removes the invoice from cached pages and decrements total", async () => {
    gqlMutate.mockResolvedValueOnce({ adminDeleteInvoice: { id: 2 } });
    const queryClient = createQueryClient();
    const queryKey = ["adminInvoices", { status: null, search: null }];
    queryClient.setQueryData(queryKey, {
      pages: [
        makeConnection([
          makeAdminInvoice({ id: 1 }),
          makeAdminInvoice({ id: 2 }),
        ]),
      ],
      pageParams: [undefined],
    });

    const { result } = renderHook(() => useAdminCrudInvoices(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.deleteInvoice(2);

    const cached = queryClient.getQueryData<{
      pages: AdminConnection<AdminInvoice>[];
    }>(queryKey);
    expect(cached?.pages[0].items.map((i) => i.id)).toEqual([1]);
    expect(cached?.pages[0].total).toBe(1);
  });
});
