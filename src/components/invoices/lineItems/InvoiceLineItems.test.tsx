import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { InvoiceItem, InvoiceAddItemInput } from "@/types/invoices.types";
import type { InvoiceItemRowProps } from "@/types/invoices.types";

vi.mock("@/components/invoices/itemRows/InvoiceItemRow", () => ({
  InvoiceItemRow: (props: InvoiceItemRowProps) => (
    <div data-testid="item-row">
      <span>{props.item.description}</span>
      <span data-testid={`editing-${props.item.id}`}>
        {String(props.editing)}
      </span>
      <button onClick={props.onStartEdit}>{`start-${props.item.id}`}</button>
      <button onClick={props.onSave}>{`save-${props.item.id}`}</button>
      <button onClick={props.onCancel}>{`cancel-${props.item.id}`}</button>
      <button onClick={props.onRemove}>{`remove-${props.item.id}`}</button>
      <input
        aria-label={`desc-${props.item.id}`}
        value={props.editState.desc}
        onChange={(e) => props.onChangeDesc(e.target.value)}
      />
      <input
        aria-label={`qty-${props.item.id}`}
        value={props.editState.qty}
        onChange={(e) => props.onChangeQty(e.target.value)}
      />
      <input
        aria-label={`price-${props.item.id}`}
        value={props.editState.price}
        onChange={(e) => props.onChangePrice(e.target.value)}
      />
    </div>
  ),
}));

vi.mock("@/components/invoices/dialogs/AddItemDialog", () => ({
  AddItemDialog: ({
    open,
    alreadyAddedEntryIds,
  }: {
    open: boolean;
    alreadyAddedEntryIds: Set<number>;
  }) =>
    open ? (
      <div data-testid="add-dialog">{[...alreadyAddedEntryIds].join(",")}</div>
    ) : null,
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

  it("passes already-added time entry ids to AddItemDialog", () => {
    renderLineItems([
      makeItem({ id: 1, timeEntryId: 10 }),
      makeItem({ id: 2, timeEntryId: null }),
      makeItem({ id: 3, timeEntryId: 12 }),
    ]);
    fireEvent.click(screen.getByRole("button", { name: "+ Add item" }));
    expect(screen.getByTestId("add-dialog")).toHaveTextContent("10,12");
  });

  it("starts editing an item on onStartEdit and cancels on onCancel", () => {
    renderLineItems([makeItem({ id: 1 })]);
    expect(screen.getByTestId("editing-1")).toHaveTextContent("false");
    fireEvent.click(screen.getByText("start-1"));
    expect(screen.getByTestId("editing-1")).toHaveTextContent("true");
    fireEvent.click(screen.getByText("cancel-1"));
    expect(screen.getByTestId("editing-1")).toHaveTextContent("false");
  });

  it("only one item is editing at a time", () => {
    renderLineItems([makeItem({ id: 1 }), makeItem({ id: 2 })]);
    fireEvent.click(screen.getByText("start-1"));
    expect(screen.getByTestId("editing-1")).toHaveTextContent("true");
    expect(screen.getByTestId("editing-2")).toHaveTextContent("false");
    fireEvent.click(screen.getByText("start-2"));
    expect(screen.getByTestId("editing-1")).toHaveTextContent("false");
    expect(screen.getByTestId("editing-2")).toHaveTextContent("true");
  });

  it("calls onUpdateItem with parsed qty/price and cancels edit on save", async () => {
    const onUpdateItem = vi.fn().mockResolvedValue({});
    renderLineItems([makeItem({ id: 1, description: "Translation" })], {
      onUpdateItem,
    });
    fireEvent.click(screen.getByText("start-1"));
    fireEvent.change(screen.getByLabelText("desc-1"), {
      target: { value: "Updated" },
    });
    fireEvent.change(screen.getByLabelText("qty-1"), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText("price-1"), {
      target: { value: "12.5" },
    });
    fireEvent.click(screen.getByText("save-1"));

    await vi.waitFor(() =>
      expect(onUpdateItem).toHaveBeenCalledWith({
        id: 1,
        description: "Updated",
        quantity: 3,
        unitPrice: 12.5,
      }),
    );
    await vi.waitFor(() =>
      expect(screen.getByTestId("editing-1")).toHaveTextContent("false"),
    );
  });

  it("does not call onUpdateItem when qty or price is not a valid number", async () => {
    const onUpdateItem = vi.fn().mockResolvedValue({});
    renderLineItems([makeItem({ id: 1 })], { onUpdateItem });
    fireEvent.click(screen.getByText("start-1"));
    fireEvent.change(screen.getByLabelText("qty-1"), {
      target: { value: "abc" },
    });
    fireEvent.click(screen.getByText("save-1"));

    await new Promise((r) => setTimeout(r, 0));
    expect(onUpdateItem).not.toHaveBeenCalled();
  });

  it("calls onRemoveItem with the item id", () => {
    const onRemoveItem = vi.fn();
    renderLineItems([makeItem({ id: 7 })], { onRemoveItem });
    fireEvent.click(screen.getByText("remove-7"));
    expect(onRemoveItem).toHaveBeenCalledWith(7);
  });
});
