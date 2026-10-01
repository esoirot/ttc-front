import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDateRangeFilter } from "./useDateRangeFilter";

describe("useDateRangeFilter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-17T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("defaults to a 30-day window ending today", () => {
    const { result } = renderHook(() => useDateRangeFilter());

    expect(result.current.startDate).toBe("2026-05-18");
    expect(result.current.endDate).toBe("2026-06-17");
    expect(result.current.startIso).toBe(new Date(2026, 4, 18).toISOString());
    expect(result.current.endIso).toBe(
      new Date(2026, 5, 17, 23, 59, 59, 999).toISOString(),
    );
  });

  it("updates startIso/endIso when dates change", () => {
    const { result } = renderHook(() => useDateRangeFilter());

    act(() => {
      result.current.setStartDate("2026-01-01");
      result.current.setEndDate("2026-01-31");
    });

    expect(result.current.startIso).toBe(new Date(2026, 0, 1).toISOString());
    expect(result.current.endIso).toBe(
      new Date(2026, 0, 31, 23, 59, 59, 999).toISOString(),
    );
  });
});
