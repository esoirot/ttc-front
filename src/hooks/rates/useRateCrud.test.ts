import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TranslationRateFormData } from "@/types/rates.types";

const { createRate, updateRate, deleteRate } = vi.hoisted(() => ({
  createRate: vi.fn(),
  updateRate: vi.fn(),
  deleteRate: vi.fn(),
}));

vi.mock("./useRates", () => ({
  useCreateRate: () => ({ createRate, loading: false }),
  useUpdateRate: () => ({ updateRate, loading: false }),
  useDeleteRate: () => ({ deleteRate }),
}));

import { useRateCrud } from "./useRateCrud";

function makeFormData(
  overrides: Partial<TranslationRateFormData> = {},
): TranslationRateFormData {
  return {
    name: "Standard",
    amount: 50,
    currency: "EUR",
    ...overrides,
  };
}

describe("useRateCrud", () => {
  beforeEach(() => {
    createRate.mockReset();
    updateRate.mockReset();
    deleteRate.mockReset();
  });

  it("starts with form closed and no rate being edited", () => {
    const { result } = renderHook(() => useRateCrud("HOURLY"));

    expect(result.current.showForm).toBe(false);
    expect(result.current.editingId).toBeNull();
  });

  it("setShowForm/setEditingId update state directly", () => {
    const { result } = renderHook(() => useRateCrud("HOURLY"));

    act(() => {
      result.current.setShowForm(true);
      result.current.setEditingId(7);
    });

    expect(result.current.showForm).toBe(true);
    expect(result.current.editingId).toBe(7);
  });

  it("handleCreate calls createRate with the type merged in and closes the form", async () => {
    createRate.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useRateCrud("PER_WORD"));

    act(() => {
      result.current.setShowForm(true);
    });
    await act(async () => {
      await result.current.handleCreate(makeFormData({ name: "Words" }));
    });

    expect(createRate).toHaveBeenCalledWith({
      type: "PER_WORD",
      name: "Words",
      amount: 50,
      currency: "EUR",
    });
    expect(result.current.showForm).toBe(false);
  });

  it("handleUpdate calls updateRate with the id merged in and clears editingId", async () => {
    updateRate.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useRateCrud("FIXED"));

    act(() => {
      result.current.setEditingId(3);
    });
    await act(async () => {
      await result.current.handleUpdate(3, makeFormData({ name: "Renamed" }));
    });

    expect(updateRate).toHaveBeenCalledWith({
      id: 3,
      name: "Renamed",
      amount: 50,
      currency: "EUR",
    });
    expect(result.current.editingId).toBeNull();
  });

  it("exposes deleteRate unchanged from useDeleteRate", () => {
    const { result } = renderHook(() => useRateCrud("HOURLY"));

    expect(result.current.deleteRate).toBe(deleteRate);
  });
});
