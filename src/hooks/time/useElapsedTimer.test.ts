import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useElapsedTimer } from "./useElapsedTimer";

describe("useElapsedTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-17T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns empty string when startIso is null", () => {
    const { result } = renderHook(() => useElapsedTimer(null));

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(result.current).toBe("");
  });

  it("ticks formatted elapsed duration once a timer is running", () => {
    const { result } = renderHook(() =>
      useElapsedTimer("2026-06-17T12:00:00.000Z"),
    );

    expect(result.current).toBe("");

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe("0:00:01");

    act(() => {
      vi.advanceTimersByTime(3600_000);
    });
    expect(result.current).toBe("1:00:01");
  });

  it("clears the interval and resets when startIso becomes null", () => {
    const { result, rerender } = renderHook(
      ({ startIso }: { startIso: string | null }) => useElapsedTimer(startIso),
      {
        initialProps: {
          startIso: "2026-06-17T12:00:00.000Z" as string | null,
        },
      },
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current).toBe("0:00:02");

    rerender({ startIso: null });
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(result.current).toBe("");
  });
});
