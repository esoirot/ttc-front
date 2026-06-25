import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Task } from "@/types/tasks.types";
import { useSortableTaskEdit } from "./useSortableTaskEdit";

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

describe("useSortableTaskEdit", () => {
  it("initializes edit fields from the task and starts not editing", () => {
    const task = makeTask({
      assigneeId: 7,
      dueDate: "2026-06-20T00:00:00.000Z",
    });
    const { result } = renderHook(() => useSortableTaskEdit(task, vi.fn()));

    expect(result.current.editing).toBe(false);
    expect(result.current.editAssigneeId).toBe("7");
    expect(result.current.editDueDate).toBe("2026-06-20");
  });

  it("defaults to empty strings when assignee/dueDate are absent", () => {
    const { result } = renderHook(() =>
      useSortableTaskEdit(makeTask(), vi.fn()),
    );

    expect(result.current.editAssigneeId).toBe("");
    expect(result.current.editDueDate).toBe("");
  });

  it("handleStartEdit resets fields from the task and flips editing on", () => {
    const task = makeTask({
      assigneeId: 3,
      dueDate: "2026-07-01T00:00:00.000Z",
    });
    const { result } = renderHook(() => useSortableTaskEdit(task, vi.fn()));

    act(() => {
      result.current.setEditAssigneeId("999");
    });
    act(() => {
      result.current.handleStartEdit();
    });

    expect(result.current.editing).toBe(true);
    expect(result.current.editAssigneeId).toBe("3");
    expect(result.current.editDueDate).toBe("2026-07-01");
  });

  it("handleSave calls onUpdate with parsed assigneeId/dueDate and closes editing", () => {
    const onUpdate = vi.fn();
    const task = makeTask({ id: 42 });
    const { result } = renderHook(() => useSortableTaskEdit(task, onUpdate));

    act(() => {
      result.current.setEditAssigneeId("9");
      result.current.setEditDueDate("2026-08-15");
    });
    act(() => {
      result.current.handleSave();
    });

    expect(onUpdate).toHaveBeenCalledWith(42, 9, "2026-08-15");
    expect(result.current.editing).toBe(false);
  });

  it("handleSave passes undefined for empty assigneeId/dueDate", () => {
    const onUpdate = vi.fn();
    const task = makeTask({ id: 1 });
    const { result } = renderHook(() => useSortableTaskEdit(task, onUpdate));

    act(() => {
      result.current.setEditAssigneeId("");
      result.current.setEditDueDate("");
    });
    act(() => {
      result.current.handleSave();
    });

    expect(onUpdate).toHaveBeenCalledWith(1, undefined, undefined);
  });
});
