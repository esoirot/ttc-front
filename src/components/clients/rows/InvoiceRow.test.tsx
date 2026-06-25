import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Invoice } from "@/types/invoices.types";
import { InvoiceRow } from "./InvoiceRow";

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
    clientId: 1,
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
        description: "Line 1",
        quantity: 2,
        unitPrice: 50,
        total: 100,
      },
    ],
    ...overrides,
  };
}

describe("InvoiceRow", () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  it("renders the invoice number, status, and computed total", () => {
    render(<InvoiceRow inv={makeInvoice()} />);

    expect(screen.getByText("INV-0001")).toBeInTheDocument();
    expect(screen.getByText("DRAFT")).toBeInTheDocument();
    expect(screen.getByText("100.00 EUR")).toBeInTheDocument();
  });

  it("sums multiple line items into the total", () => {
    render(
      <InvoiceRow
        inv={makeInvoice({
          items: [
            {
              id: 1,
              invoiceId: 1,
              projectId: null,
              timeEntryId: null,
              description: "A",
              quantity: 1,
              unitPrice: 30,
              total: 30,
            },
            {
              id: 2,
              invoiceId: 1,
              projectId: null,
              timeEntryId: null,
              description: "B",
              quantity: 1,
              unitPrice: 20,
              total: 20,
            },
          ],
        })}
      />,
    );

    expect(screen.getByText("50.00 EUR")).toBeInTheDocument();
  });

  it("shows issuedAt date when present, falling back to createdAt", () => {
    render(
      <InvoiceRow
        inv={makeInvoice({ issuedAt: "2026-03-15T00:00:00.000Z" })}
      />,
    );
    expect(screen.getByText("2026-03-15")).toBeInTheDocument();
  });

  it("falls back to createdAt when issuedAt is null", () => {
    render(
      <InvoiceRow
        inv={makeInvoice({
          issuedAt: null,
          createdAt: "2026-02-01T00:00:00.000Z",
        })}
      />,
    );
    expect(screen.getByText("2026-02-01")).toBeInTheDocument();
  });

  it("navigates to the invoice detail page when clicked", () => {
    render(<InvoiceRow inv={makeInvoice({ id: 9 })} />);

    fireEvent.click(screen.getByText("INV-0001"));

    expect(navigateMock).toHaveBeenCalledWith("/invoices/9");
  });
});
