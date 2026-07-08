import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Task } from "@/types/tasks.types";
import { useTaskDragReorder } from "./useTaskDragReorder";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    projectId: 1,
    assigneeId: null,
    title: "Translate doc",
    description: null,
    status: "TODO",
    dueDate: null,
    startDate: null,
    recurring: null,
    reminderOffset: null,
    sortOrder: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as Task;
}

describe("useTaskDragReorder", () => {
  it("no-ops when dropped on itself or with no drop target", () => {
    const onReorder = vi.fn();
    const tasks = [makeTask({ id: 1 }), makeTask({ id: 2 })];
    const { result } = renderHook(() => useTaskDragReorder(tasks, onReorder));

    act(() => {
      result.current.handleDragEnd(
        { active: { id: 1 }, over: { id: 1 } } as never,
        [1, 2],
      );
    });
    act(() => {
      result.current.handleDragEnd(
        { active: { id: 1 }, over: null } as never,
        [1, 2],
      );
    });

    expect(onReorder).not.toHaveBeenCalled();
    expect(result.current.displayTasks).toEqual(tasks);
  });

  it("reorders displayTasks and calls onReorder with the new index on a valid drop", () => {
    const onReorder = vi.fn();
    const tasks = [
      makeTask({ id: 1 }),
      makeTask({ id: 2 }),
      makeTask({ id: 3 }),
    ];
    const { result } = renderHook(() => useTaskDragReorder(tasks, onReorder));

    act(() => {
      result.current.handleDragEnd(
        { active: { id: 1 }, over: { id: 3 } } as never,
        [1, 2, 3],
      );
    });

    expect(onReorder).toHaveBeenCalledWith(1, 2);
    expect(result.current.displayTasks.map((t) => t.id)).toEqual([2, 3, 1]);
  });
});
