import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import {
  TASKS_QUERY,
  MY_TASKS_QUERY,
  TASK_QUERY,
  CREATE_TASK_MUTATION,
  UPDATE_TASK_MUTATION,
  DELETE_TASK_MUTATION,
  CREATE_SUBTASK_MUTATION,
  UPDATE_SUBTASK_MUTATION,
  DELETE_SUBTASK_MUTATION,
  CREATE_COMMENT_MUTATION,
  UPDATE_COMMENT_MUTATION,
  DELETE_COMMENT_MUTATION,
} from "../../graphql/tasks.operations";
import type {
  Task,
  TaskDetail,
  TaskConnection,
  TaskStatus,
  Subtask,
  TaskComment,
} from "@/types/tasks.types";
import { gqlRequest } from "@/lib/api";

const LIMIT = 50;

export function useTasks(projectId: number) {
  const { data, fetchNextPage, hasNextPage, isLoading, error } =
    useInfiniteQuery<TaskConnection>({
      queryKey: ["tasks", projectId],
      queryFn: ({ pageParam }) =>
        gqlRequest<{ tasks: TaskConnection }>(TASKS_QUERY, {
          projectId,
          pagination: {
            limit: LIMIT,
            ...(pageParam != null ? { cursor: pageParam as number } : {}),
          },
        }).then((d) => d.tasks),
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });

  return {
    tasks: data?.pages.flatMap((p) => p.items) ?? [],
    total: data?.pages[0]?.total ?? 0,
    hasMore: !!hasNextPage,
    loadMore: () => void fetchNextPage(),
    loading: isLoading,
    error,
  };
}

export function useMyTasks() {
  const { data, fetchNextPage, hasNextPage, isLoading, error } =
    useInfiniteQuery<TaskConnection>({
      queryKey: ["myTasks"],
      queryFn: ({ pageParam }) =>
        gqlRequest<{ myTasks: TaskConnection }>(MY_TASKS_QUERY, {
          pagination: {
            limit: LIMIT,
            ...(pageParam != null ? { cursor: pageParam as number } : {}),
          },
        }).then((d) => d.myTasks),
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });

  return {
    tasks: data?.pages.flatMap((p) => p.items) ?? [],
    total: data?.pages[0]?.total ?? 0,
    hasMore: !!hasNextPage,
    loadMore: () => void fetchNextPage(),
    loading: isLoading,
    error,
  };
}

export function useTask(id: number) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["task", id],
    queryFn: () =>
      gqlRequest<{ task: TaskDetail }>(TASK_QUERY, { id }).then((d) => d.task),
    enabled: !!id,
  });
  return { task: data ?? null, loading: isLoading, error, refetch };
}

type CreateTaskInput = {
  projectId: number;
  title: string;
  description?: string;
  assigneeId?: number;
  status?: TaskStatus;
  dueDate?: string;
};

export function useCreateTask(projectId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (input: CreateTaskInput) =>
      gqlRequest<{ createTask: Task }>(CREATE_TASK_MUTATION, {
        input,
      }).then((d) => d.createTask),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
  return {
    createTask: (input: CreateTaskInput) => mutateAsync(input),
    loading: isPending,
    error,
  };
}

type UpdateTaskInput = {
  id: number;
  title?: string;
  description?: string;
  status?: TaskStatus;
  sortOrder?: number;
  dueDate?: string;
  assigneeId?: number;
  projectId?: number;
};

export function useUpdateTask(projectId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (input: UpdateTaskInput) =>
      gqlRequest<{ updateTask: Task }>(UPDATE_TASK_MUTATION, {
        input,
      }).then((d) => d.updateTask),
    onSuccess: (updated) => {
      queryClient.setQueryData<InfiniteData<TaskConnection>>(
        ["tasks", projectId],
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  items: page.items.map((t) =>
                    t.id === updated.id ? updated : t,
                  ),
                })),
              }
            : old,
      );
      queryClient.setQueryData<TaskDetail>(["task", updated.id], (old) =>
        old ? { ...old, ...updated } : old,
      );
    },
  });
  return {
    updateTask: (input: UpdateTaskInput) => mutateAsync(input),
    loading: isPending,
    error,
  };
}

export function useDeleteTask(projectId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (id: number) =>
      gqlRequest<{ deleteTask: boolean }>(DELETE_TASK_MUTATION, {
        id,
      }).then((d) => d.deleteTask),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<InfiniteData<TaskConnection>>(
        ["tasks", projectId],
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  items: page.items.filter((t) => t.id !== id),
                  total: page.total - 1,
                })),
              }
            : old,
      );
      queryClient.removeQueries({ queryKey: ["task", id] });
    },
  });
  return {
    deleteTask: (id: number) => mutateAsync(id),
    loading: isPending,
    error,
  };
}

export function useUpdateMyTask() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (input: UpdateTaskInput) =>
      gqlRequest<{ updateTask: Task }>(UPDATE_TASK_MUTATION, {
        input,
      }).then((d) => d.updateTask),
    onSuccess: (updated) => {
      queryClient.setQueryData<InfiniteData<TaskConnection>>(
        ["myTasks"],
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  items: page.items.map((t) =>
                    t.id === updated.id ? updated : t,
                  ),
                })),
              }
            : old,
      );
    },
  });
  return {
    updateTask: (input: UpdateTaskInput) => mutateAsync(input),
    loading: isPending,
    error,
  };
}

export function useCreateSubtask(taskId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (title: string) =>
      gqlRequest<{ createSubtask: Subtask }>(CREATE_SUBTASK_MUTATION, {
        input: { taskId, title },
      }).then((d) => d.createSubtask),
    onSuccess: (newSubtask) => {
      queryClient.setQueryData<TaskDetail>(["task", taskId], (old) =>
        old ? { ...old, subtasks: [...old.subtasks, newSubtask] } : old,
      );
    },
  });
  return {
    createSubtask: (title: string) => mutateAsync(title),
    loading: isPending,
  };
}

export function useUpdateSubtask(taskId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (input: { id: number; title?: string; done?: boolean }) =>
      gqlRequest<{ updateSubtask: Subtask }>(UPDATE_SUBTASK_MUTATION, {
        input,
      }).then((d) => d.updateSubtask),
    onSuccess: (updated) => {
      queryClient.setQueryData<TaskDetail>(["task", taskId], (old) =>
        old
          ? {
              ...old,
              subtasks: old.subtasks.map((s) =>
                s.id === updated.id ? updated : s,
              ),
            }
          : old,
      );
    },
  });
  return {
    updateSubtask: (input: { id: number; title?: string; done?: boolean }) =>
      mutateAsync(input),
    loading: isPending,
  };
}

export function useDeleteSubtask(taskId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: (id: number) =>
      gqlRequest<{ deleteSubtask: boolean }>(DELETE_SUBTASK_MUTATION, {
        id,
      }).then((d) => d.deleteSubtask),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<TaskDetail>(["task", taskId], (old) =>
        old
          ? { ...old, subtasks: old.subtasks.filter((s) => s.id !== id) }
          : old,
      );
    },
  });
  return { deleteSubtask: (id: number) => mutateAsync(id) };
}

export function useCreateComment(taskId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (body: string) =>
      gqlRequest<{ createTaskComment: TaskComment }>(CREATE_COMMENT_MUTATION, {
        input: { taskId, body },
      }).then((d) => d.createTaskComment),
    onSuccess: (newComment) => {
      queryClient.setQueryData<TaskDetail>(["task", taskId], (old) =>
        old ? { ...old, comments: [...old.comments, newComment] } : old,
      );
    },
  });
  return {
    createComment: (body: string) => mutateAsync(body),
    loading: isPending,
  };
}

export function useUpdateComment(taskId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (input: { id: number; body: string }) =>
      gqlRequest<{ updateTaskComment: TaskComment }>(UPDATE_COMMENT_MUTATION, {
        input,
      }).then((d) => d.updateTaskComment),
    onSuccess: (updated) => {
      queryClient.setQueryData<TaskDetail>(["task", taskId], (old) =>
        old
          ? {
              ...old,
              comments: old.comments.map((c) =>
                c.id === updated.id ? updated : c,
              ),
            }
          : old,
      );
    },
  });
  return {
    updateComment: (input: { id: number; body: string }) => mutateAsync(input),
    loading: isPending,
  };
}

export function useDeleteComment(taskId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: (id: number) =>
      gqlRequest<{ deleteTaskComment: boolean }>(DELETE_COMMENT_MUTATION, {
        id,
      }).then((d) => d.deleteTaskComment),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<TaskDetail>(["task", taskId], (old) =>
        old
          ? { ...old, comments: old.comments.filter((c) => c.id !== id) }
          : old,
      );
    },
  });
  return { deleteComment: (id: number) => mutateAsync(id) };
}
