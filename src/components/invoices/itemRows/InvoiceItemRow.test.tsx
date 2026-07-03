import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { InvoiceItem } from "@/types/invoices.types";
import { InvoiceItemRow } from "./InvoiceItemRow";

function makeItem(overrides: Partial<InvoiceItem> = {}): InvoiceItem {
  return {
    id: 1,
    invoiceId: 1,
    projectId: null,
    timeEntryId: null,
    description: "Translation",
    quantity: 2,
    unitPrice: 25,
    total: 50,
    ...overrides,
  };
}

describe("InvoiceItemRow", () => {
  it("shows description, quantity, unit price, and total in view mode", () => {
    render(
      <InvoiceItemRow
        item={makeItem()}
        editing={false}
        editState={{ desc: "", qty: "", price: "" }}
        onStartEdit={vi.fn()}
        onChangeDesc={vi.fn()}
        onChangeQty={vi.fn()}
        onChangePrice={vi.fn()}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByText("Translation")).toBeInTheDocument();
    expect(screen.getByText("2.00")).toBeInTheDocument();
    expect(screen.getByText("25.00")).toBeInTheDocument();
    expect(screen.getByText("50.00")).toBeInTheDocument();
  });

  it("calls onStartEdit when a value is clicked", () => {
    const onStartEdit = vi.fn();
    render(
      <InvoiceItemRow
        item={makeItem()}
        editing={false}
        editState={{ desc: "", qty: "", price: "" }}
        onStartEdit={onStartEdit}
        onChangeDesc={vi.fn()}
        onChangeQty={vi.fn()}
        onChangePrice={vi.fn()}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Translation"));
    expect(onStartEdit).toHaveBeenCalled();
  });

  it("calls onRemove when the remove button is clicked", () => {
    const onRemove = vi.fn();
    render(
      <InvoiceItemRow
        item={makeItem()}
        editing={false}
        editState={{ desc: "", qty: "", price: "" }}
        onStartEdit={vi.fn()}
        onChangeDesc={vi.fn()}
        onChangeQty={vi.fn()}
        onChangePrice={vi.fn()}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        onRemove={onRemove}
      />,
    );

    fireEvent.click(screen.getByLabelText("Remove item"));
    expect(onRemove).toHaveBeenCalled();
  });

  it("shows editable inputs and a live total preview in edit mode", () => {
    render(
      <InvoiceItemRow
        item={makeItem()}
        editing={true}
        editState={{ desc: "Translation", qty: "3", price: "10" }}
        onStartEdit={vi.fn()}
        onChangeDesc={vi.fn()}
        onChangeQty={vi.fn()}
        onChangePrice={vi.fn()}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Description")).toHaveValue("Translation");
    expect(screen.getByText("30.00")).toBeInTheDocument();
  });

  it("calls onChangeDesc/Qty/Price as inputs change", () => {
    const onChangeDesc = vi.fn();
    const onChangeQty = vi.fn();
    const onChangePrice = vi.fn();
    render(
      <InvoiceItemRow
        item={makeItem()}
        editing={true}
        editState={{ desc: "", qty: "", price: "" }}
        onStartEdit={vi.fn()}
        onChangeDesc={onChangeDesc}
        onChangeQty={onChangeQty}
        onChangePrice={onChangePrice}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "New" },
    });
    fireEvent.change(screen.getByLabelText("Quantity"), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText("Unit price"), {
      target: { value: "9" },
    });

    expect(onChangeDesc).toHaveBeenCalledWith("New");
    expect(onChangeQty).toHaveBeenCalledWith("5");
    expect(onChangePrice).toHaveBeenCalledWith("9");
  });

  it("saves on Enter in the price field and cancels on Escape", () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(
      <InvoiceItemRow
        item={makeItem()}
        editing={true}
        editState={{ desc: "", qty: "", price: "" }}
        onStartEdit={vi.fn()}
        onChangeDesc={vi.fn()}
        onChangeQty={vi.fn()}
        onChangePrice={vi.fn()}
        onSave={onSave}
        onCancel={onCancel}
        onRemove={vi.fn()}
      />,
    );

    fireEvent.keyDown(screen.getByLabelText("Unit price"), { key: "Enter" });
    expect(onSave).toHaveBeenCalled();

    fireEvent.keyDown(screen.getByLabelText("Description"), { key: "Escape" });
    expect(onCancel).toHaveBeenCalled();
  });

  it("cancels on Escape in the Quantity field", () => {
    const onCancel = vi.fn();
    render(
      <InvoiceItemRow
        item={makeItem()}
        editing={true}
        editState={{ desc: "", qty: "", price: "" }}
        onStartEdit={vi.fn()}
        onChangeDesc={vi.fn()}
        onChangeQty={vi.fn()}
        onChangePrice={vi.fn()}
        onSave={vi.fn()}
        onCancel={onCancel}
        onRemove={vi.fn()}
      />,
    );
    fireEvent.keyDown(screen.getByLabelText("Quantity"), { key: "Escape" });
    expect(onCancel).toHaveBeenCalled();
  });

  it("calls onSave/onCancel when the ✓/✕ buttons are clicked in edit mode", () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(
      <InvoiceItemRow
        item={makeItem()}
        editing={true}
        editState={{ desc: "", qty: "", price: "" }}
        onStartEdit={vi.fn()}
        onChangeDesc={vi.fn()}
        onChangeQty={vi.fn()}
        onChangePrice={vi.fn()}
        onSave={onSave}
        onCancel={onCancel}
        onRemove={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("✓"));
    expect(onSave).toHaveBeenCalled();
    fireEvent.click(screen.getByText("✕"));
    expect(onCancel).toHaveBeenCalled();
  });

  it("calls onStartEdit when the quantity or unit price value is clicked", () => {
    const onStartEdit = vi.fn();
    render(
      <InvoiceItemRow
        item={makeItem()}
        editing={false}
        editState={{ desc: "", qty: "", price: "" }}
        onStartEdit={onStartEdit}
        onChangeDesc={vi.fn()}
        onChangeQty={vi.fn()}
        onChangePrice={vi.fn()}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("2.00"));
    fireEvent.click(screen.getByText("25.00"));
    expect(onStartEdit).toHaveBeenCalledTimes(2);
  });

  it("shows a clock icon when the item is linked to a time entry", () => {
    const { container } = render(
      <InvoiceItemRow
        item={makeItem({ timeEntryId: 5 })}
        editing={false}
        editState={{ desc: "", qty: "", price: "" }}
        onStartEdit={vi.fn()}
        onChangeDesc={vi.fn()}
        onChangeQty={vi.fn()}
        onChangePrice={vi.fn()}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
