import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useBulkSelection } from "./useBulkSelection";

describe("useBulkSelection", () => {
  it("starts with nothing selected", () => {
    const { result } = renderHook(() => useBulkSelection([1, 2, 3]));
    expect(result.current.selected.size).toBe(0);
    expect(result.current.isAllSelected).toBe(false);
  });

  it("toggle adds an id, toggling again removes it", () => {
    const { result } = renderHook(() => useBulkSelection([1, 2, 3]));

    act(() => result.current.toggle(2));
    expect(result.current.selected.has(2)).toBe(true);

    act(() => result.current.toggle(2));
    expect(result.current.selected.has(2)).toBe(false);
  });

  it("toggleAll selects every id, calling again deselects all", () => {
    const { result } = renderHook(() => useBulkSelection([1, 2, 3]));

    act(() => result.current.toggleAll());
    expect(result.current.selected).toEqual(new Set([1, 2, 3]));
    expect(result.current.isAllSelected).toBe(true);

    act(() => result.current.toggleAll());
    expect(result.current.selected.size).toBe(0);
    expect(result.current.isAllSelected).toBe(false);
  });

  it("isAllSelected is false when allIds is empty", () => {
    const { result } = renderHook(() => useBulkSelection<number>([]));
    expect(result.current.isAllSelected).toBe(false);
  });

  it("clear empties the selection", () => {
    const { result } = renderHook(() => useBulkSelection([1, 2, 3]));

    act(() => result.current.toggle(1));
    act(() => result.current.toggle(2));
    act(() => result.current.clear());

    expect(result.current.selected.size).toBe(0);
  });

  it("works with string ids", () => {
    const { result } = renderHook(() => useBulkSelection(["a", "b"]));

    act(() => result.current.toggle("a"));
    expect(result.current.selected.has("a")).toBe(true);
  });
});
