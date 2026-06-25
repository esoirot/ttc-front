import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Invoice } from "@/types/invoices.types";
import { InvoiceListCard } from "./InvoiceListCard";

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: () => navigateMock };
});

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
    items: [
      {
        id: 1,
        invoiceId: 1,
        projectId: null,
        timeEntryId: null,
        description: "Line",
        quantity: 1,
        unitPrice: 50,
        total: 50,
      },
    ],
    ...overrides,
  };
}

describe("InvoiceListCard", () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  it("shows 'No client' when clientName is not provided", () => {
    render(<InvoiceListCard inv={makeInvoice()} clientName={undefined} />);
    expect(screen.getByText(/No client/)).toBeInTheDocument();
  });

  it("shows the client name and due date when present", () => {
    render(
      <InvoiceListCard
        inv={makeInvoice({ dueDate: "2026-07-01T00:00:00.000Z" })}
        clientName="Acme"
      />,
    );
    expect(screen.getByText(/Acme/)).toBeInTheDocument();
    expect(screen.getByText(/Due 2026-07-01/)).toBeInTheDocument();
  });

  it("sums item totals and shows the status badge", () => {
    render(<InvoiceListCard inv={makeInvoice()} clientName="Acme" />);
    expect(screen.getByText("50.00 EUR")).toBeInTheDocument();
    expect(screen.getByText("DRAFT")).toBeInTheDocument();
  });

  it("navigates to the invoice detail page when clicked", () => {
    render(<InvoiceListCard inv={makeInvoice({ id: 8 })} clientName="Acme" />);
    fireEvent.click(screen.getByText("INV-0001"));
    expect(navigateMock).toHaveBeenCalledWith("/invoices/8");
  });
});
