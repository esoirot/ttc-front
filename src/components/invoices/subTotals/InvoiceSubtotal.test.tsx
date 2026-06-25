import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InvoiceSubtotal } from "./InvoiceSubtotal";

describe("InvoiceSubtotal", () => {
  it("sums item totals and shows the currency", () => {
    render(
      <InvoiceSubtotal
        items={[
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
        ]}
        currency="USD"
      />,
    );

    expect(screen.getByText("50.00 USD")).toBeInTheDocument();
  });

  it("shows 0.00 for an empty item list", () => {
    render(<InvoiceSubtotal items={[]} currency="EUR" />);
    expect(screen.getByText("0.00 EUR")).toBeInTheDocument();
  });
});
