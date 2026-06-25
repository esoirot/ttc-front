import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Invoice } from "@/types/invoices.types";

const useInvoicesPageMock = vi.fn();
vi.mock("@/hooks/invoices/useInvoicesPage", () => ({
  useInvoicesPage: () => useInvoicesPageMock(),
}));

vi.mock("@/components/invoices/forms/CreateInvoiceForm", () => ({
  CreateInvoiceForm: () => <div data-testid="create-form" />,
}));

vi.mock("@/components/invoices/forms/GenerateInvoiceForm", () => ({
  GenerateInvoiceForm: () => <div data-testid="generate-form" />,
}));

vi.mock("@/components/invoices/cards/InvoiceListCard", () => ({
  InvoiceListCard: ({ inv }: { inv: Invoice }) => (
    <div data-testid="invoice-card">{inv.number}</div>
  ),
}));

import { InvoicesList } from "./InvoicesList";

function makeInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: 1,
    userId: 1,
    clientId: null,
    number: "INV-001",
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

function defaultPageState() {
  return {
    navigate: vi.fn(),
    tab: "ALL" as const,
    setTab: vi.fn(),
    search: "",
    setSearch: vi.fn(),
    invoices: [] as Invoice[],
    loading: false,
    hasMore: false,
    loadMore: vi.fn(),
    total: 0,
    clients: [],
    projects: [],
    clientMap: {} as Record<number, string>,
    showCreate: false,
    setShowCreate: vi.fn(),
    showGenerate: false,
    setShowGenerate: vi.fn(),
    toggleCreate: vi.fn(),
    toggleGenerate: vi.fn(),
  };
}

function renderList(
  stateOverrides: Partial<ReturnType<typeof defaultPageState>> = {},
) {
  useInvoicesPageMock.mockReturnValue({
    ...defaultPageState(),
    ...stateOverrides,
  });
  return render(<InvoicesList />);
}

describe("InvoicesList", () => {
  beforeEach(() => {
    useInvoicesPageMock.mockReset();
  });

  it('shows "No invoices." when list is empty and not loading', () => {
    renderList({ invoices: [], loading: false });
    expect(screen.getByText("No invoices.")).toBeInTheDocument();
  });

  it("renders invoice cards for each invoice", () => {
    renderList({
      invoices: [
        makeInvoice({ id: 1, number: "INV-001" }),
        makeInvoice({ id: 2, number: "INV-002" }),
      ],
      total: 2,
    });
    expect(screen.getAllByTestId("invoice-card")).toHaveLength(2);
    expect(screen.getByText("INV-001")).toBeInTheDocument();
    expect(screen.getByText("INV-002")).toBeInTheDocument();
  });

  it("shows count when invoices are loaded", () => {
    renderList({
      invoices: [makeInvoice()],
      total: 10,
    });
    expect(screen.getByText("1 of 10")).toBeInTheDocument();
  });

  it("does not show No invoices. when loading", () => {
    renderList({ invoices: [], loading: true });
    expect(screen.queryByText("No invoices.")).not.toBeInTheDocument();
  });

  it("renders search input", () => {
    renderList();
    expect(screen.getByPlaceholderText("Search invoices…")).toBeInTheDocument();
  });

  it("renders status tabs: All, Draft, Sent, Paid", () => {
    renderList();
    for (const label of ["All", "Draft", "Sent", "Paid"]) {
      expect(screen.getByRole("tab", { name: label })).toBeInTheDocument();
    }
  });

  it("shows Load more button when hasMore=true", () => {
    renderList({ invoices: [makeInvoice()], total: 5, hasMore: true });
    expect(
      screen.getByRole("button", { name: "Load more" }),
    ).toBeInTheDocument();
  });

  it("does not show Load more when hasMore=false", () => {
    renderList({ invoices: [makeInvoice()], total: 1, hasMore: false });
    expect(
      screen.queryByRole("button", { name: "Load more" }),
    ).not.toBeInTheDocument();
  });

  it("calls loadMore when Load more is clicked", () => {
    const loadMore = vi.fn();
    renderList({
      invoices: [makeInvoice()],
      total: 5,
      hasMore: true,
      loadMore,
    });
    fireEvent.click(screen.getByRole("button", { name: "Load more" }));
    expect(loadMore).toHaveBeenCalled();
  });

  it("calls toggleCreate when New invoice is clicked", () => {
    const toggleCreate = vi.fn();
    renderList({ toggleCreate });
    fireEvent.click(screen.getByRole("button", { name: "New invoice" }));
    expect(toggleCreate).toHaveBeenCalled();
  });

  it("calls toggleGenerate when Generate from project is clicked", () => {
    const toggleGenerate = vi.fn();
    renderList({ toggleGenerate });
    fireEvent.click(
      screen.getByRole("button", { name: "Generate from project" }),
    );
    expect(toggleGenerate).toHaveBeenCalled();
  });

  it("shows CreateInvoiceForm when showCreate=true", () => {
    renderList({ showCreate: true });
    expect(screen.getByTestId("create-form")).toBeInTheDocument();
  });

  it("hides CreateInvoiceForm when showCreate=false", () => {
    renderList({ showCreate: false });
    expect(screen.queryByTestId("create-form")).not.toBeInTheDocument();
  });

  it("shows GenerateInvoiceForm when showGenerate=true", () => {
    renderList({ showGenerate: true });
    expect(screen.getByTestId("generate-form")).toBeInTheDocument();
  });

  it("hides GenerateInvoiceForm when showGenerate=false", () => {
    renderList({ showGenerate: false });
    expect(screen.queryByTestId("generate-form")).not.toBeInTheDocument();
  });
});
