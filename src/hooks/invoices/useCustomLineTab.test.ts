import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TranslationRate } from "@/types/rates.types";

const { rates } = vi.hoisted(() => ({
  rates: [] as TranslationRate[],
}));

vi.mock("../rates/useRates", () => ({
  useRates: () => ({ rates }),
}));

import { useCustomLineTab } from "./useCustomLineTab";

function makeRate(overrides: Partial<TranslationRate> = {}): TranslationRate {
  return {
    id: 1,
    userId: 1,
    activityId: null,
    clientId: null,
    type: "HOURLY",
    name: "Standard",
    amount: 50,
    currency: "EUR",
    description: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("useCustomLineTab", () => {
  beforeEach(() => {
    rates.length = 0;
  });

  it("starts with empty fields and qty defaulted to 1", () => {
    const onAdd = vi.fn();
    const { result } = renderHook(() => useCustomLineTab(1, onAdd));

    expect(result.current.selectedRateId).toBe("");
    expect(result.current.desc).toBe("");
    expect(result.current.qty).toBe("1");
    expect(result.current.price).toBe("0");
    expect(result.current.selectedRate).toBeUndefined();
  });

  it("handleRateSelect fills desc/price from the matched rate", () => {
    rates.push(makeRate({ id: 9, name: "Editing", amount: 75 }));
    const onAdd = vi.fn();
    const { result } = renderHook(() => useCustomLineTab(1, onAdd));

    act(() => {
      result.current.handleRateSelect("9");
    });

    expect(result.current.selectedRateId).toBe("9");
    expect(result.current.selectedRate?.id).toBe(9);
    expect(result.current.desc).toBe("Editing");
    expect(result.current.price).toBe("75");
  });

  it("handleRateSelect resets qty to 1 for FIXED type rates", () => {
    rates.push(makeRate({ id: 2, type: "FIXED" }));
    const onAdd = vi.fn();
    const { result } = renderHook(() => useCustomLineTab(1, onAdd));

    act(() => {
      result.current.setQty("5");
    });
    act(() => {
      result.current.handleRateSelect("2");
    });

    expect(result.current.qty).toBe("1");
  });

  it("handleRateSelect does not touch desc/price when rate id is unknown", () => {
    const onAdd = vi.fn();
    const { result } = renderHook(() => useCustomLineTab(1, onAdd));

    act(() => {
      result.current.setDesc("kept");
      result.current.handleRateSelect("missing");
    });

    expect(result.current.selectedRateId).toBe("missing");
    expect(result.current.desc).toBe("kept");
  });

  it("handleAdd calls onAdd with parsed numbers and trimmed description", async () => {
    const onAdd = vi.fn().mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useCustomLineTab(42, onAdd));

    act(() => {
      result.current.setDesc("  Custom line  ");
      result.current.setQty("3");
      result.current.setPrice("10.5");
    });
    await act(async () => {
      await result.current.handleAdd();
    });

    expect(onAdd).toHaveBeenCalledWith({
      invoiceId: 42,
      description: "Custom line",
      quantity: 3,
      unitPrice: 10.5,
    });
  });

  it("handleAdd resets desc/qty/selectedRateId but keeps price after success", async () => {
    rates.push(makeRate({ id: 4 }));
    const onAdd = vi.fn().mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useCustomLineTab(1, onAdd));

    act(() => {
      result.current.setDesc("Line");
      result.current.handleRateSelect("4");
    });
    await act(async () => {
      await result.current.handleAdd();
    });

    expect(result.current.desc).toBe("");
    expect(result.current.qty).toBe("1");
    expect(result.current.selectedRateId).toBe("");
    expect(result.current.price).toBe("50");
  });

  it("handleAdd does nothing when description is blank", async () => {
    const onAdd = vi.fn();
    const { result } = renderHook(() => useCustomLineTab(1, onAdd));

    act(() => {
      result.current.setDesc("   ");
    });
    await act(async () => {
      await result.current.handleAdd();
    });

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("handleAdd does nothing when qty or price is not a number", async () => {
    const onAdd = vi.fn();
    const { result } = renderHook(() => useCustomLineTab(1, onAdd));

    act(() => {
      result.current.setDesc("Valid desc");
      result.current.setQty("abc");
    });
    await act(async () => {
      await result.current.handleAdd();
    });

    expect(onAdd).not.toHaveBeenCalled();
  });
});
