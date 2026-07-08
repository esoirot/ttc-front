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

  it("fetches the project's tasks", async () => {
    gqlFetch.mockResolvedValueOnce({
      tasks: makeConnection([
        makeTask({ id: 1, status: "TODO" }),
        makeTask({ id: 2, status: "DONE" }),
      ]),
    });

    const { result } = renderHook(() => useProjectTaskList({ projectId: 1 }), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.tasks.map((t) => t.id)).toEqual([1, 2]);
  });

  it("statusFilter defaults to ALL and can be changed", async () => {
    gqlFetch.mockResolvedValueOnce({ tasks: makeConnection([]) });

    const { result } = renderHook(() => useProjectTaskList({ projectId: 1 }), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.statusFilter).toBe("ALL");

    act(() => {
      result.current.setStatusFilter("DONE");
    });

    expect(result.current.statusFilter).toBe("DONE");
  });

  it("createTask calls the create mutation with the given input", async () => {
    gqlFetch.mockResolvedValueOnce({ tasks: makeConnection([]) });
    gqlMutate.mockResolvedValueOnce({ createTask: makeTask({ id: 9 }) });

    const { result } = renderHook(() => useProjectTaskList({ projectId: 1 }), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createTask({ projectId: 1, title: "New task" });
    });

    expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), {
      input: { projectId: 1, title: "New task" },
    });
  });

  it("deleteTask and updateTask call their respective mutations", async () => {
    gqlFetch.mockResolvedValueOnce({
      tasks: makeConnection([makeTask({ id: 1 })]),
    });
    gqlMutate.mockResolvedValue({ deleteTask: true, updateTask: makeTask() });

    const { result } = renderHook(() => useProjectTaskList({ projectId: 1 }), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteTask(1);
    });
    await act(async () => {
      await result.current.updateTask({ id: 1, status: "DONE" });
    });

    expect(gqlMutate).toHaveBeenCalledTimes(2);
  });
});
