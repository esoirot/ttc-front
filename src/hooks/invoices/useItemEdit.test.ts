import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { InvoiceItem } from "@/types/invoices.types";
import { useItemEdit } from "./useItemEdit";

function makeItem(overrides: Partial<InvoiceItem> = {}): InvoiceItem {
  return {
    id: 1,
    invoiceId: 1,
    projectId: null,
    timeEntryId: null,
    description: "Translation work",
    quantity: 2,
    unitPrice: 50,
    total: 100,
    ...overrides,
  };
}

describe("useItemEdit", () => {
  it("starts with no item being edited", () => {
    const { result } = renderHook(() => useItemEdit());

    expect(result.current.editingId).toBeNull();
    expect(result.current.editState).toEqual({ desc: "", qty: "", price: "" });
  });

  it("startEdit loads the item's fields into edit state as strings", () => {
    const { result } = renderHook(() => useItemEdit());

    act(() => {
      result.current.startEdit(
        makeItem({ id: 5, quantity: 3, unitPrice: 25.5 }),
      );
    });

    expect(result.current.editingId).toBe(5);
    expect(result.current.editState).toEqual({
      desc: "Translation work",
      qty: "3",
      price: "25.5",
    });
  });

  it("cancelEdit clears editingId but leaves field state untouched", () => {
    const { result } = renderHook(() => useItemEdit());

    act(() => {
      result.current.startEdit(makeItem());
    });
    act(() => {
      result.current.cancelEdit();
    });

    expect(result.current.editingId).toBeNull();
    expect(result.current.editState.desc).toBe("Translation work");
  });

  it("setEditDesc/Qty/Price update the edit state", () => {
    const { result } = renderHook(() => useItemEdit());

    act(() => {
      result.current.setEditDesc("New desc");
      result.current.setEditQty("7");
      result.current.setEditPrice("12.34");
    });

    expect(result.current.editState).toEqual({
      desc: "New desc",
      qty: "7",
      price: "12.34",
    });
  });
});
