import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { getLocale, setLocale, useLocale } from "./useLocale";

const STORAGE_KEY = "ttc_locale";

describe("useLocale", () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  afterEach(() => {
    setLocale("en");
    localStorage.removeItem(STORAGE_KEY);
  });

  it("defaults to English", () => {
    expect(getLocale()).toBe("en");
  });

  it("switches locale and persists the choice", () => {
    const { result } = renderHook(() => useLocale());

    act(() => result.current.setLocale("fr"));

    expect(result.current.locale).toBe("fr");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("fr");
  });

  it("toggleLocale flips between en and fr", () => {
    const { result } = renderHook(() => useLocale());

    act(() => result.current.toggleLocale());
    expect(result.current.locale).toBe("fr");

    act(() => result.current.toggleLocale());
    expect(result.current.locale).toBe("en");
  });

  it("notifies subscribers across hook instances", () => {
    const a = renderHook(() => useLocale());
    const b = renderHook(() => useLocale());

    act(() => a.result.current.setLocale("fr"));

    expect(a.result.current.locale).toBe("fr");
    expect(b.result.current.locale).toBe("fr");
  });
});
