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
    expect(result.current.startIso).toBe("2026-05-18T00:00:00");
    expect(result.current.endIso).toBe("2026-06-17T23:59:59");
  });

  it("updates startIso/endIso when dates change", () => {
    const { result } = renderHook(() => useDateRangeFilter());

    act(() => {
      result.current.setStartDate("2026-01-01");
      result.current.setEndDate("2026-01-31");
    });

    expect(result.current.startIso).toBe("2026-01-01T00:00:00");
    expect(result.current.endIso).toBe("2026-01-31T23:59:59");
  });
});
