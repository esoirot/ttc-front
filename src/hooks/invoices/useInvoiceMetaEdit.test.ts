import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi, type Mock } from "vitest";
import { useInvoiceMetaEdit } from "./useInvoiceMetaEdit";
import type { InvoiceMetaUpdateInput } from "@/types/invoices.types";

type OnUpdateMock = Mock<(input: InvoiceMetaUpdateInput) => Promise<unknown>>;

function setup(
  overrides: {
    clientId?: number | null;
    currency?: string;
    dueDate?: string | null;
    notes?: string | null;
    onUpdate?: OnUpdateMock;
  } = {},
) {
  const onUpdate =
    overrides.onUpdate ??
    (vi
      .fn<(input: InvoiceMetaUpdateInput) => Promise<unknown>>()
      .mockResolvedValue(undefined) as OnUpdateMock);
  const hook = renderHook(() =>
    useInvoiceMetaEdit({
      clientId: "clientId" in overrides ? overrides.clientId! : 5,
      currency: overrides.currency ?? "EUR",
      dueDate:
        "dueDate" in overrides
          ? overrides.dueDate!
          : "2026-03-15T00:00:00.000Z",
      notes: "notes" in overrides ? overrides.notes! : "Net 30",
      onUpdate,
    }),
  );
  return { ...hook, onUpdate };
}

describe("useInvoiceMetaEdit", () => {
  it("initializes form from props and starts not editing", () => {
    const { result } = setup();

    expect(result.current.editing).toBe(false);
    expect(result.current.saving).toBe(false);
    expect(result.current.form).toEqual({
      clientId: "5",
      currency: "EUR",
      dueDate: "2026-03-15",
      notes: "Net 30",
    });
  });

  it("uses 'none' for null clientId and empty strings for null dueDate/notes", () => {
    const { result } = setup({ clientId: null, dueDate: null, notes: null });

    expect(result.current.form).toEqual({
      clientId: "none",
      currency: "EUR",
      dueDate: "",
      notes: "",
    });
  });

  it("openEdit resets form from current props and sets editing true", () => {
    const { result } = setup();

    act(() => {
      result.current.setForm({
        clientId: "none",
        currency: "USD",
        dueDate: "",
        notes: "scratch",
      });
    });
    act(() => {
      result.current.openEdit();
    });

    expect(result.current.editing).toBe(true);
    expect(result.current.form).toEqual({
      clientId: "5",
      currency: "EUR",
      dueDate: "2026-03-15",
      notes: "Net 30",
    });
  });

  it("cancelEdit sets editing to false without touching form", () => {
    const { result } = setup();

    act(() => {
      result.current.openEdit();
      result.current.setForm({ ...result.current.form, notes: "edited" });
    });
    act(() => {
      result.current.cancelEdit();
    });

    expect(result.current.editing).toBe(false);
    expect(result.current.form.notes).toBe("edited");
  });

  it("handleSave calls onUpdate with parsed values and closes editing", async () => {
    const { result, onUpdate } = setup();

    act(() => {
      result.current.openEdit();
      result.current.setForm({
        clientId: "12",
        currency: "USD",
        dueDate: "2026-04-01",
        notes: "  trimmed  ",
      });
    });
    await act(async () => {
      await result.current.handleSave();
    });

    expect(onUpdate).toHaveBeenCalledWith({
      clientId: 12,
      currency: "USD",
      dueDate: "2026-04-01",
      notes: "trimmed",
    });
    expect(result.current.editing).toBe(false);
    expect(result.current.saving).toBe(false);
  });

  it("handleSave sends null clientId/dueDate/notes when cleared", async () => {
    const { result, onUpdate } = setup();

    act(() => {
      result.current.setForm({
        clientId: "none",
        currency: "EUR",
        dueDate: "",
        notes: "   ",
      });
    });
    await act(async () => {
      await result.current.handleSave();
    });

    expect(onUpdate).toHaveBeenCalledWith({
      clientId: null,
      currency: "EUR",
      dueDate: null,
      notes: null,
    });
  });

  it("handleSave resets saving to false even when onUpdate rejects", async () => {
    const onUpdate = vi
      .fn<(input: InvoiceMetaUpdateInput) => Promise<unknown>>()
      .mockRejectedValueOnce(new Error("boom"));
    const { result } = setup({ onUpdate });

    await act(async () => {
      await expect(result.current.handleSave()).rejects.toThrow("boom");
    });

    expect(result.current.saving).toBe(false);
    expect(result.current.editing).toBe(false);
  });
});
