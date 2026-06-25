import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { InvoiceItem, InvoiceAddItemInput } from "@/types/invoices.types";

vi.mock("@/components/invoices/itemRows/InvoiceItemRow", () => ({
  InvoiceItemRow: ({ item }: { item: InvoiceItem }) => (
    <div data-testid="item-row">{item.description}</div>
  ),
}));

vi.mock("@/components/invoices/dialogs/AddItemDialog", () => ({
  AddItemDialog: ({ open }: { open: boolean }) =>
    open ? <div data-testid="add-dialog" /> : null,
}));

import { InvoiceLineItems } from "./InvoiceLineItems";

function makeItem(overrides: Partial<InvoiceItem> = {}): InvoiceItem {
  return {
    id: 1,
    invoiceId: 4,
    projectId: null,
    timeEntryId: null,
    description: "Translation",
    quantity: 1,
    unitPrice: 0.05,
    total: 0.05,
    ...overrides,
  };
}

function renderLineItems(
  items: InvoiceItem[] = [],
  props: Partial<Parameters<typeof InvoiceLineItems>[0]> = {},
) {
  return render(
    <InvoiceLineItems
      invoiceId={4}
      items={items}
      onAddItem={vi
        .fn<(input: InvoiceAddItemInput) => Promise<unknown>>()
        .mockResolvedValue({})}
      onUpdateItem={vi.fn().mockResolvedValue({})}
      onRemoveItem={vi.fn()}
      adding={false}
      {...props}
    />,
  );
}

describe("InvoiceLineItems", () => {
  it('shows "Line items" card title', () => {
    renderLineItems();
    expect(screen.getByText("Line items")).toBeInTheDocument();
  });

  it('shows "No items yet." when there are no items', () => {
    renderLineItems([]);
    expect(screen.getByText("No items yet.")).toBeInTheDocument();
  });

  it("renders column headers", () => {
    renderLineItems();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Qty")).toBeInTheDocument();
    expect(screen.getByText("Unit price")).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();
  });

  it("renders one InvoiceItemRow per item", () => {
    renderLineItems([
      makeItem({ id: 1 }),
      makeItem({ id: 2, description: "Editing" }),
    ]);
    expect(screen.getAllByTestId("item-row")).toHaveLength(2);
  });

  it("passes description to item row", () => {
    renderLineItems([makeItem({ description: "Proofreading" })]);
    expect(screen.getByText("Proofreading")).toBeInTheDocument();
  });

  it('shows "+ Add item" button', () => {
    renderLineItems();
    expect(
      screen.getByRole("button", { name: "+ Add item" }),
    ).toBeInTheDocument();
  });

  it("AddItemDialog is closed by default", () => {
    renderLineItems();
    expect(screen.queryByTestId("add-dialog")).not.toBeInTheDocument();
  });

  it("opens AddItemDialog when + Add item is clicked", () => {
    renderLineItems();
    fireEvent.click(screen.getByRole("button", { name: "+ Add item" }));
    expect(screen.getByTestId("add-dialog")).toBeInTheDocument();
  });
});
