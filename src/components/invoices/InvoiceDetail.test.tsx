import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Invoice } from "@/types/invoices.types";

const paramsMock = vi.fn(() => ({ id: "7" }));
vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ...actual,
    useParams: () => paramsMock(),
  };
});

const useInvoiceDetailMock = vi.fn();
vi.mock("@/hooks/invoices/useInvoiceDetail", () => ({
  useInvoiceDetail: () => useInvoiceDetailMock(),
}));

vi.mock("./headers/InvoiceDetailHeader", () => ({
  InvoiceDetailHeader: ({ number }: { number: string }) => (
    <div>Header: {number}</div>
  ),
}));
vi.mock("./cards/InvoiceMetaCard", () => ({
  InvoiceMetaCard: () => <div>Meta card</div>,
}));
vi.mock("./lineItems/InvoiceLineItems", () => ({
  InvoiceLineItems: () => <div>Line items</div>,
}));
vi.mock("./subTotals/InvoiceSubtotal", () => ({
  InvoiceSubtotal: () => <div>Subtotal</div>,
}));

import { InvoiceDetail } from "./InvoiceDetail";

function makeInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: 7,
    userId: 1,
    clientId: null,
    number: "INV-007",
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

function defaultState() {
  return {
    invoice: makeInvoice(),
    loading: false,
    user: undefined,
    updateInvoice: vi.fn().mockResolvedValue(undefined),
    addItem: vi.fn(),
    adding: false,
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    downloading: false,
    handleDownloadPdf: vi.fn(),
    handleDelete: vi.fn(),
  };
}

describe("InvoiceDetail", () => {
  beforeEach(() => {
    useInvoiceDetailMock.mockReset();
    useInvoiceDetailMock.mockReturnValue(defaultState());
  });

  it("shows a loading skeleton while loading", () => {
    useInvoiceDetailMock.mockReturnValue({
      ...defaultState(),
      loading: true,
    });
    render(<InvoiceDetail />);
    expect(screen.queryByText(/Header:/)).not.toBeInTheDocument();
  });

  it("shows 'Invoice not found.' when the invoice is null and not loading", () => {
    useInvoiceDetailMock.mockReturnValue({
      ...defaultState(),
      invoice: null,
    });
    render(<InvoiceDetail />);
    expect(screen.getByText("Invoice not found.")).toBeInTheDocument();
  });

  it("renders the header, meta card, line items, and subtotal when loaded", () => {
    render(<InvoiceDetail />);
    expect(screen.getByText("Header: INV-007")).toBeInTheDocument();
    expect(screen.getByText("Meta card")).toBeInTheDocument();
    expect(screen.getByText("Line items")).toBeInTheDocument();
    expect(screen.getByText("Subtotal")).toBeInTheDocument();
  });
});
