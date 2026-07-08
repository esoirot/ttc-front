import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createQueryClient,
  createQueryWrapper,
} from "@/test/queryClientWrapper";
import type { Task, TaskConnection, TaskDetail } from "@/types/tasks.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import {
  useCreateComment,
  useCreateTask,
  useCreateTaskLabel,
  useDeleteComment,
  useDeleteTask,
  useMyTasks,
  useTask,
  useTasks,
  useUpdateMyTask,
  useUpdateTask,
} from "./useTasks";

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

function makeTaskDetail(overrides: Partial<TaskDetail> = {}): TaskDetail {
  return {
    ...makeTask(),
    checklistTitles: [],
    subtasks: [],
    comments: [],
    labels: [],
    activities: [],
    attachments: [],
    ...overrides,
  } as TaskDetail;
}

function makeConnection(
  items: Task[],
  nextCursor: number | null = null,
): TaskConnection {
  return { items, nextCursor, total: items.length };
}

describe("useTasks", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("flattens the first page for the given project", async () => {
    const task = makeTask();
    gqlFetch.mockResolvedValueOnce({ tasks: makeConnection([task]) });

    const { result } = renderHook(() => useTasks(1), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.tasks).toEqual([task]);
    expect(gqlFetch.mock.calls[0][1].projectId).toBe(1);
  });
});

describe("useMyTasks", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("flattens tasks assigned to the current user", async () => {
    const task = makeTask({ id: 2 });
    gqlFetch.mockResolvedValueOnce({ myTasks: makeConnection([task]) });

    const { result } = renderHook(() => useMyTasks(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.tasks).toEqual([task]);
  });
});

describe("useTask", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("fetches task detail by id", async () => {
    const detail = makeTaskDetail({ id: 5 });
    gqlFetch.mockResolvedValueOnce({ task: detail });

    const { result } = renderHook(() => useTask(5), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.task).toEqual(detail);
  });
});

describe("useCreateTask", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("invalidates the project's task list on success", async () => {
    const created = makeTask({ id: 9 });
    gqlMutate.mockResolvedValueOnce({ createTask: created });
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateTask(1), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.createTask({ projectId: 1, title: "New" });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["tasks", 1] });
  });
});

describe("useUpdateTask", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("patches the task in the project list cache and the task detail cache", async () => {
    const updated = makeTask({ id: 3, title: "Renamed" });
    gqlMutate.mockResolvedValueOnce({ updateTask: updated });
    const queryClient = createQueryClient();
    queryClient.setQueryData(["tasks", 1], {
      pages: [makeConnection([makeTask({ id: 3, title: "Old" })])],
      pageParams: [undefined],
    });
    queryClient.setQueryData(
      ["task", 3],
      makeTaskDetail({ id: 3, title: "Old" }),
    );

    const { result } = renderHook(() => useUpdateTask(1), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.updateTask({ id: 3, title: "Renamed" });

    const list = queryClient.getQueryData<{ pages: TaskConnection[] }>([
      "tasks",
      1,
    ]);
    expect(list?.pages[0].items[0].title).toBe("Renamed");
    const detail = queryClient.getQueryData<TaskDetail>(["task", 3]);
    expect(detail?.title).toBe("Renamed");
  });

  it("optimistically patches the status in the project list cache before the mutation resolves", async () => {
    let resolveMutate!: (value: { updateTask: Task }) => void;
    gqlMutate.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveMutate = resolve;
      }),
    );
    const queryClient = createQueryClient();
    queryClient.setQueryData(["tasks", 1], {
      pages: [makeConnection([makeTask({ id: 3, status: "TODO" })])],
      pageParams: [undefined],
    });

    const { result } = renderHook(() => useUpdateTask(1), {
      wrapper: createQueryWrapper(queryClient),
    });

    const pending = result.current.updateTask({ id: 3, status: "DONE" });

    await waitFor(() => {
      const list = queryClient.getQueryData<{ pages: TaskConnection[] }>([
        "tasks",
        1,
      ]);
      expect(list?.pages[0].items[0].status).toBe("DONE");
    });

    resolveMutate({ updateTask: makeTask({ id: 3, status: "DONE" }) });
    await pending;
  });

  it("rolls back the optimistic status patch when the mutation fails", async () => {
    gqlMutate.mockRejectedValueOnce(new Error("boom"));
    const queryClient = createQueryClient();
    queryClient.setQueryData(["tasks", 1], {
      pages: [makeConnection([makeTask({ id: 3, status: "TODO" })])],
      pageParams: [undefined],
    });

    const { result } = renderHook(() => useUpdateTask(1), {
      wrapper: createQueryWrapper(queryClient),
    });

    await expect(
      result.current.updateTask({ id: 3, status: "DONE" }),
    ).rejects.toThrow("boom");

    const list = queryClient.getQueryData<{ pages: TaskConnection[] }>([
      "tasks",
      1,
    ]);
    expect(list?.pages[0].items[0].status).toBe("TODO");
  });

  it("does not touch the project list cache for a sortOrder-only update", async () => {
    let resolveMutate!: (value: { updateTask: Task }) => void;
    gqlMutate.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveMutate = resolve;
      }),
    );
    const queryClient = createQueryClient();
    const seeded = {
      pages: [makeConnection([makeTask({ id: 3, sortOrder: 0 })])],
      pageParams: [undefined],
    };
    queryClient.setQueryData(["tasks", 1], seeded);

    const { result } = renderHook(() => useUpdateTask(1), {
      wrapper: createQueryWrapper(queryClient),
    });

    const pending = result.current.updateTask({ id: 3, sortOrder: 2 });

    const list = queryClient.getQueryData<{ pages: TaskConnection[] }>([
      "tasks",
      1,
    ]);
    expect(list).toEqual(seeded);

    resolveMutate({ updateTask: makeTask({ id: 3, sortOrder: 2 }) });
    await pending;
  });
});

describe("useDeleteTask", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("removes the task from the project list cache and evicts task detail", async () => {
    gqlMutate.mockResolvedValueOnce({ deleteTask: true });
    const queryClient = createQueryClient();
    queryClient.setQueryData(["tasks", 1], {
      pages: [makeConnection([makeTask({ id: 1 }), makeTask({ id: 2 })])],
      pageParams: [undefined],
    });
    queryClient.setQueryData(["task", 2], makeTaskDetail({ id: 2 }));

    const { result } = renderHook(() => useDeleteTask(1), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.deleteTask(2);

    const list = queryClient.getQueryData<{ pages: TaskConnection[] }>([
      "tasks",
      1,
    ]);
    expect(list?.pages[0].items.map((t) => t.id)).toEqual([1]);
    expect(queryClient.getQueryData(["task", 2])).toBeUndefined();
  });
});

describe("useUpdateMyTask", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("patches the myTasks cache regardless of project", async () => {
    const updated = makeTask({ id: 7, status: "DONE" });
    gqlMutate.mockResolvedValueOnce({ updateTask: updated });
    const queryClient = createQueryClient();
    queryClient.setQueryData(["myTasks"], {
      pages: [makeConnection([makeTask({ id: 7, status: "TODO" })])],
      pageParams: [undefined],
    });

    const { result } = renderHook(() => useUpdateMyTask(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.updateTask({ id: 7, status: "DONE" });

    const list = queryClient.getQueryData<{ pages: TaskConnection[] }>([
      "myTasks",
    ]);
    expect(list?.pages[0].items[0].status).toBe("DONE");
  });
});

describe("useCreateComment", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("appends the new comment to the task detail cache", async () => {
    const comment = {
      id: 1,
      taskId: 4,
      authorId: 1,
      body: "Looks good",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    gqlMutate.mockResolvedValueOnce({ createTaskComment: comment });
    const queryClient = createQueryClient();
    queryClient.setQueryData(["task", 4], makeTaskDetail({ id: 4 }));

    const { result } = renderHook(() => useCreateComment(4), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.createComment("Looks good");

    const detail = queryClient.getQueryData<TaskDetail>(["task", 4]);
    expect(detail?.comments).toEqual([comment]);
  });
});

describe("useDeleteComment", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("removes the comment from the task detail cache", async () => {
    gqlMutate.mockResolvedValueOnce({ deleteTaskComment: true });
    const queryClient = createQueryClient();
    queryClient.setQueryData(
      ["task", 4],
      makeTaskDetail({
        id: 4,
        comments: [
          {
            id: 1,
            taskId: 4,
            authorId: 1,
            body: "x",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        ],
      }),
    );

    const { result } = renderHook(() => useDeleteComment(4), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.deleteComment(1);

    const detail = queryClient.getQueryData<TaskDetail>(["task", 4]);
    expect(detail?.comments).toEqual([]);
  });
});

describe("useCreateTaskLabel", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("appends the new label to the task detail cache", async () => {
    const label = {
      id: 1,
      taskId: 4,
      name: "Urgent",
      color: "#f00",
      createdAt: "2026-01-01T00:00:00.000Z",
    };
    gqlMutate.mockResolvedValueOnce({ createTaskLabel: label });
    const queryClient = createQueryClient();
    queryClient.setQueryData(["task", 4], makeTaskDetail({ id: 4 }));

    const { result } = renderHook(() => useCreateTaskLabel(4), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.createLabel({ name: "Urgent" });

    const detail = queryClient.getQueryData<TaskDetail>(["task", 4]);
    expect(detail?.labels).toEqual([label]);
  });
});
