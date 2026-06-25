import { renderHook, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { createQueryClient } from "@/test/queryClientWrapper";
import type { Invoice } from "@/types/invoices.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));
const { apiGet } = vi.hoisted(() => ({ apiGet: vi.fn() }));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));
vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return { ...actual, apiGet };
});

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: () => navigateMock };
});

import { useInvoiceDetail } from "./useInvoiceDetail";

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

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe("useInvoiceDetail", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
    apiGet.mockReset();
    navigateMock.mockReset();
    gqlFetch.mockResolvedValue({ me: null });
  });

  it("loads the invoice", async () => {
    const invoice = makeInvoice({ id: 4 });
    gqlFetch
      .mockResolvedValueOnce({ invoice })
      .mockResolvedValueOnce({ me: null });

    const { result } = renderHook(() => useInvoiceDetail(4), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.invoice).toEqual(invoice);
  });

  it("handleDelete deletes the invoice then navigates to /invoices", async () => {
    gqlFetch
      .mockResolvedValueOnce({ invoice: makeInvoice({ id: 4 }) })
      .mockResolvedValueOnce({ me: null });
    gqlMutate.mockResolvedValueOnce({ deleteInvoice: true });

    const { result } = renderHook(() => useInvoiceDetail(4), { wrapper });

    result.current.handleDelete();

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith("/invoices"));
  });

  it("handleDownloadPdf fetches the blob, triggers a download, and resets downloading", async () => {
    gqlFetch
      .mockResolvedValueOnce({ invoice: makeInvoice({ id: 4 }) })
      .mockResolvedValueOnce({ me: null });
    const blob = new Blob(["pdf"], { type: "application/pdf" });
    apiGet.mockResolvedValueOnce(blob);
    const createObjectURL = vi.fn(() => "blob:mock-url");
    const revokeObjectURL = vi.fn();
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    const { result } = renderHook(() => useInvoiceDetail(4), { wrapper });

    await result.current.handleDownloadPdf();

    expect(apiGet).toHaveBeenCalledWith("/invoices/4/pdf", {
      responseType: "blob",
    });
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    expect(result.current.downloading).toBe(false);

    clickSpy.mockRestore();
  });
});
