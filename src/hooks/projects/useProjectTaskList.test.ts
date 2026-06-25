import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryWrapper } from "@/test/queryClientWrapper";
import type { Task, TaskConnection } from "@/types/tasks.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { useProjectTaskList } from "./useProjectTaskList";

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

function makeConnection(items: Task[]): TaskConnection {
  return { items, nextCursor: null, total: items.length };
}

describe("useProjectTaskList", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("filters tasks by status", async () => {
    gqlFetch.mockResolvedValueOnce({
      tasks: makeConnection([
        makeTask({ id: 1, status: "TODO" }),
        makeTask({ id: 2, status: "DONE" }),
      ]),
    });

    const { result } = renderHook(
      () => useProjectTaskList({ projectId: 1, members: [] }),
      { wrapper: createQueryWrapper() },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setStatusFilter("DONE");
    });

    expect(result.current.filtered.map((t) => t.id)).toEqual([2]);
  });

  it("handleSelectAll selects every filtered task; handleSelect toggles one", async () => {
    gqlFetch.mockResolvedValueOnce({
      tasks: makeConnection([makeTask({ id: 1 }), makeTask({ id: 2 })]),
    });

    const { result } = renderHook(
      () => useProjectTaskList({ projectId: 1, members: [] }),
      { wrapper: createQueryWrapper() },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.handleSelectAll(true);
    });
    expect(result.current.allSelected).toBe(true);
    expect(result.current.selected).toEqual(new Set([1, 2]));

    act(() => {
      result.current.handleSelect(1, false);
    });
    expect(result.current.selected).toEqual(new Set([2]));
    expect(result.current.allSelected).toBe(false);
  });

  it("handleCreate does nothing for a blank title", async () => {
    gqlFetch.mockResolvedValueOnce({ tasks: makeConnection([]) });

    const { result } = renderHook(
      () => useProjectTaskList({ projectId: 1, members: [] }),
      { wrapper: createQueryWrapper() },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setNewTitle("   ");
    });
    await act(async () => {
      await result.current.handleCreate();
    });

    expect(gqlMutate).not.toHaveBeenCalled();
  });

  it("handleCreate creates the task, clears the title, and closes the form", async () => {
    gqlFetch.mockResolvedValueOnce({ tasks: makeConnection([]) });
    gqlMutate.mockResolvedValueOnce({ createTask: makeTask({ id: 9 }) });

    const { result } = renderHook(
      () => useProjectTaskList({ projectId: 1, members: [] }),
      { wrapper: createQueryWrapper() },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setNewTitle("New task");
      result.current.setShowCreate(true);
    });
    await act(async () => {
      await result.current.handleCreate();
    });

    expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), {
      input: { projectId: 1, title: "New task" },
    });
    expect(result.current.newTitle).toBe("");
    expect(result.current.showCreate).toBe(false);
  });

  it("handleBulkDelete deletes each selected task and clears the selection", async () => {
    gqlFetch.mockResolvedValueOnce({
      tasks: makeConnection([makeTask({ id: 1 }), makeTask({ id: 2 })]),
    });
    gqlMutate.mockResolvedValue({ deleteTask: true });

    const { result } = renderHook(
      () => useProjectTaskList({ projectId: 1, members: [] }),
      { wrapper: createQueryWrapper() },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.handleSelectAll(true);
    });
    await act(async () => {
      await result.current.handleBulkDelete();
    });

    expect(gqlMutate).toHaveBeenCalledTimes(2);
    expect(result.current.selected).toEqual(new Set());
  });

  it("handleBulkStatus updates each selected task to the chosen status", async () => {
    gqlFetch.mockResolvedValueOnce({
      tasks: makeConnection([makeTask({ id: 1 }), makeTask({ id: 2 })]),
    });
    gqlMutate.mockResolvedValue({ updateTask: makeTask() });

    const { result } = renderHook(
      () => useProjectTaskList({ projectId: 1, members: [] }),
      { wrapper: createQueryWrapper() },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.handleSelectAll(true);
      result.current.setBulkStatus("DONE");
    });
    await act(async () => {
      await result.current.handleBulkStatus();
    });

    expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), {
      input: { id: 1, status: "DONE" },
    });
    expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), {
      input: { id: 2, status: "DONE" },
    });
  });

  it("handleDragEnd no-ops when dropped on itself or with no drop target", async () => {
    gqlFetch.mockResolvedValueOnce({
      tasks: makeConnection([makeTask({ id: 1 }), makeTask({ id: 2 })]),
    });

    const { result } = renderHook(
      () => useProjectTaskList({ projectId: 1, members: [] }),
      { wrapper: createQueryWrapper() },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.handleDragEnd({
        active: { id: 1 },
        over: { id: 1 },
      } as never);
    });

    expect(gqlMutate).not.toHaveBeenCalled();
  });
});
