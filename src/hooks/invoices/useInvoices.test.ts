import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createQueryClient,
  createQueryWrapper,
} from "@/test/queryClientWrapper";
import type { Invoice, InvoiceConnection } from "@/types/invoices.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import {
  useAddInvoiceItem,
  useCreateInvoice,
  useDeleteInvoice,
  useInvoice,
  useInvoices,
  useRemoveInvoiceItem,
  useUpdateInvoice,
  useUpdateInvoiceItem,
} from "./useInvoices";

function makeInvoice(overrides: Partial<Invoice> = {}): Invoice {
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
    ...overrides,
  };
}

function makeConnection(
  items: Invoice[],
  nextCursor: number | null = null,
): InvoiceConnection {
  return { items, nextCursor, total: items.length };
}

describe("useInvoices", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("flattens the first page", async () => {
    const invoice = makeInvoice();
    gqlFetch.mockResolvedValueOnce({ invoices: makeConnection([invoice]) });

    const { result } = renderHook(() => useInvoices(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.invoices).toEqual([invoice]);
  });

  it("passes status/clientId/search through to query variables", async () => {
    gqlFetch.mockResolvedValueOnce({ invoices: makeConnection([]) });

    renderHook(() => useInvoices("SENT", 7, "acme"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(gqlFetch).toHaveBeenCalled());
    const vars = gqlFetch.mock.calls[0][1];
    expect(vars.status).toBe("SENT");
    expect(vars.clientId).toBe(7);
    expect(vars.search).toBe("acme");
  });
});

describe("useInvoice", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("fetches a single invoice by id", async () => {
    const invoice = makeInvoice({ id: 9 });
    gqlFetch.mockResolvedValueOnce({ invoice });

    const { result } = renderHook(() => useInvoice(9), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.invoice).toEqual(invoice);
  });
});

describe("useCreateInvoice", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("invalidates the invoices list on success", async () => {
    gqlMutate.mockResolvedValueOnce({ createInvoice: makeInvoice({ id: 5 }) });
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateInvoice(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.createInvoice({ clientId: 1 });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["invoices"] });
  });
});

describe("useUpdateInvoice", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("writes the updated invoice into the single-invoice cache", async () => {
    const updated = makeInvoice({ id: 3, status: "SENT" });
    gqlMutate.mockResolvedValueOnce({ updateInvoice: updated });
    const queryClient = createQueryClient();

    const { result } = renderHook(() => useUpdateInvoice(3), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.updateInvoice({ id: 3, status: "SENT" });

    expect(queryClient.getQueryData(["invoice", 3])).toEqual(updated);
  });
});

describe("useDeleteInvoice", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("removes the invoice from cached list pages and evicts the detail cache", async () => {
    gqlMutate.mockResolvedValueOnce({ deleteInvoice: true });
    const queryClient = createQueryClient();
    const queryKey = [
      "invoices",
      { status: null, clientId: null, search: null },
    ];
    queryClient.setQueryData(queryKey, {
      pages: [makeConnection([makeInvoice({ id: 1 }), makeInvoice({ id: 2 })])],
      pageParams: [undefined],
    });
    queryClient.setQueryData(["invoice", 2], makeInvoice({ id: 2 }));

    const { result } = renderHook(() => useDeleteInvoice(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.deleteInvoice(2);

    const list = queryClient.getQueryData<{ pages: InvoiceConnection[] }>(
      queryKey,
    );
    expect(list?.pages[0].items.map((i) => i.id)).toEqual([1]);
    expect(queryClient.getQueryData(["invoice", 2])).toBeUndefined();
  });
});

describe("useAddInvoiceItem", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("appends the new item to the invoice detail cache", async () => {
    const item = {
      id: 1,
      invoiceId: 4,
      projectId: null,
      timeEntryId: null,
      description: "Line",
      quantity: 1,
      unitPrice: 50,
      total: 50,
    };
    gqlMutate.mockResolvedValueOnce({ addInvoiceItem: item });
    const queryClient = createQueryClient();
    queryClient.setQueryData(["invoice", 4], makeInvoice({ id: 4 }));

    const { result } = renderHook(() => useAddInvoiceItem(4), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.addItem({
      invoiceId: 4,
      quantity: 1,
      unitPrice: 50,
    });

    const invoice = queryClient.getQueryData<Invoice>(["invoice", 4]);
    expect(invoice?.items).toEqual([item]);
  });
});

describe("useUpdateInvoiceItem", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("patches the matching item in the invoice detail cache", async () => {
    const updated = {
      id: 1,
      invoiceId: 4,
      projectId: null,
      timeEntryId: null,
      description: "Updated",
      quantity: 2,
      unitPrice: 60,
      total: 120,
    };
    gqlMutate.mockResolvedValueOnce({ updateInvoiceItem: updated });
    const queryClient = createQueryClient();
    queryClient.setQueryData(
      ["invoice", 4],
      makeInvoice({
        id: 4,
        items: [
          {
            id: 1,
            invoiceId: 4,
            projectId: null,
            timeEntryId: null,
            description: "Old",
            quantity: 1,
            unitPrice: 50,
            total: 50,
          },
        ],
      }),
    );

    const { result } = renderHook(() => useUpdateInvoiceItem(4), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.updateItem({ id: 1, description: "Updated" });

    const invoice = queryClient.getQueryData<Invoice>(["invoice", 4]);
    expect(invoice?.items[0]).toEqual(updated);
  });
});

describe("useRemoveInvoiceItem", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("removes the item from the invoice detail cache", async () => {
    gqlMutate.mockResolvedValueOnce({ removeInvoiceItem: true });
    const queryClient = createQueryClient();
    queryClient.setQueryData(
      ["invoice", 4],
      makeInvoice({
        id: 4,
        items: [
          {
            id: 1,
            invoiceId: 4,
            projectId: null,
            timeEntryId: null,
            description: "Line",
            quantity: 1,
            unitPrice: 50,
            total: 50,
          },
        ],
      }),
    );

    const { result } = renderHook(() => useRemoveInvoiceItem(4), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.removeItem(1);

    const invoice = queryClient.getQueryData<Invoice>(["invoice", 4]);
    expect(invoice?.items).toEqual([]);
  });
});
