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
let metaCardProps: { onUpdate: (input: unknown) => Promise<unknown> };
vi.mock("./cards/InvoiceMetaCard", () => ({
  InvoiceMetaCard: (props: typeof metaCardProps) => {
    metaCardProps = props;
    return <div>Meta card</div>;
  },
}));
vi.mock("./lineItems/InvoiceLineItems", () => ({
  InvoiceLineItems: () => <div>Line items</div>,
}));
vi.mock("./subTotals/InvoiceSubtotal", () => ({
  InvoiceSubtotal: () => <div>Subtotal</div>,
}));

import { InvoiceDetail } from "./InvoiceDetail";
import { createIntlWrapper } from "@/test/intlWrapper";

const wrapper = createIntlWrapper();

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
    render(<InvoiceDetail />, { wrapper });
    expect(screen.queryByText(/Header:/)).not.toBeInTheDocument();
  });

  it("shows 'Invoice not found.' when the invoice is null and not loading", () => {
    useInvoiceDetailMock.mockReturnValue({
      ...defaultState(),
      invoice: null,
    });
    render(<InvoiceDetail />, { wrapper });
    expect(screen.getByText("Invoice not found.")).toBeInTheDocument();
  });

  it("renders the header, meta card, line items, and subtotal when loaded", () => {
    render(<InvoiceDetail />, { wrapper });
    expect(screen.getByText("Header: INV-007")).toBeInTheDocument();
    expect(screen.getByText("Meta card")).toBeInTheDocument();
    expect(screen.getByText("Line items")).toBeInTheDocument();
    expect(screen.getByText("Subtotal")).toBeInTheDocument();
  });

  it("renders French copy when locale is fr", () => {
    useInvoiceDetailMock.mockReturnValue({
      ...defaultState(),
      invoice: null,
    });
    render(<InvoiceDetail />, { wrapper: createIntlWrapper("fr") });
    expect(screen.getByText("Facture introuvable.")).toBeInTheDocument();
  });

  it("clearing client, due date or notes in the meta card erases them", async () => {
    const state = defaultState();
    useInvoiceDetailMock.mockReturnValue(state);
    render(<InvoiceDetail />, { wrapper });

    await metaCardProps.onUpdate({
      clientId: null,
      currency: "EUR",
      dueDate: null,
      notes: null,
    });

    expect(state.updateInvoice).toHaveBeenCalledWith({
      id: 7,
      clientId: null,
      currency: "EUR",
      dueDate: null,
      notes: null,
    });
  });
});
