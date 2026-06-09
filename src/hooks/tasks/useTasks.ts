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
  CREATE_CHECKLIST_MUTATION,
  DELETE_CHECKLIST_MUTATION,
  RENAME_CHECKLIST_MUTATION,
  CREATE_COMMENT_MUTATION,
  UPDATE_COMMENT_MUTATION,
  DELETE_COMMENT_MUTATION,
  CREATE_TASK_LABEL_MUTATION,
  DELETE_TASK_LABEL_MUTATION,
} from "../../graphql/tasks.operations";
import type {
  Task,
  TaskDetail,
  TaskConnection,
  Subtask,
  TaskComment,
  TaskLabel,
  CreateTaskInput,
  UpdateTaskInput,
  UpdateSubtaskInput,
} from "@/types/tasks.types";
import { gqlFetch, gqlMutate } from "@/lib/apollo";

const LIMIT = 50;

export function useTasks(projectId: number) {
  const { data, fetchNextPage, hasNextPage, isLoading, error } =
    useInfiniteQuery<TaskConnection>({
      queryKey: ["tasks", projectId],
      queryFn: ({ pageParam }) =>
        gqlFetch<{ tasks: TaskConnection }>(TASKS_QUERY, {
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
        gqlFetch<{ myTasks: TaskConnection }>(MY_TASKS_QUERY, {
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
      gqlFetch<{ task: TaskDetail }>(TASK_QUERY, { id }).then((d) => d.task),
    enabled: !!id,
  });
  return { task: data ?? null, loading: isLoading, error, refetch };
}

export function useCreateTask(projectId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (input: CreateTaskInput) =>
      gqlMutate<{ createTask: Task }>(CREATE_TASK_MUTATION, { input }).then(
        (d) => d.createTask,
      ),
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

export function useUpdateTask(projectId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (input: UpdateTaskInput) =>
      gqlMutate<{ updateTask: Task }>(UPDATE_TASK_MUTATION, { input }).then(
        (d) => d.updateTask,
      ),
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
      void queryClient.invalidateQueries({ queryKey: ["task", updated.id] });
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
      gqlMutate<{ deleteTask: boolean }>(DELETE_TASK_MUTATION, {
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
      gqlMutate<{ updateTask: Task }>(UPDATE_TASK_MUTATION, { input }).then(
        (d) => d.updateTask,
      ),
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
    mutationFn: (input: {
      checklistTitle?: string;
      title: string;
      dueDate?: string;
    }) =>
      gqlMutate<{ createSubtask: Subtask }>(CREATE_SUBTASK_MUTATION, {
        input: { taskId, ...input },
      }).then((d) => d.createSubtask),
    onSuccess: () => {
      void queryClient.refetchQueries({ queryKey: ["task", taskId] });
    },
  });
  return {
    createSubtask: (input: {
      checklistTitle?: string;
      title: string;
      dueDate?: string;
    }) => mutateAsync(input),
    loading: isPending,
  };
}

export function useUpdateSubtask(taskId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (input: UpdateSubtaskInput) =>
      gqlMutate<{ updateSubtask: Subtask }>(UPDATE_SUBTASK_MUTATION, {
        input,
      }).then((d) => d.updateSubtask),
    onSuccess: () => {
      void queryClient.refetchQueries({ queryKey: ["task", taskId] });
    },
  });
  return {
    updateSubtask: (input: UpdateSubtaskInput) => mutateAsync(input),
    loading: isPending,
  };
}

export function useDeleteSubtask(taskId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: (id: number) =>
      gqlMutate<{ deleteSubtask: boolean }>(DELETE_SUBTASK_MUTATION, {
        id,
      }).then((d) => d.deleteSubtask),
    onSuccess: () => {
      void queryClient.refetchQueries({ queryKey: ["task", taskId] });
    },
  });
  return { deleteSubtask: (id: number) => mutateAsync(id) };
}

export function useCreateChecklist(taskId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (title: string) =>
      gqlMutate<{ createChecklist: boolean }>(CREATE_CHECKLIST_MUTATION, {
        taskId,
        title,
      }).then((d) => d.createChecklist),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    },
  });
  return {
    createChecklist: (title: string) => mutateAsync(title),
    loading: isPending,
  };
}

export function useDeleteChecklist(taskId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (title: string) =>
      gqlMutate<{ deleteChecklist: boolean }>(DELETE_CHECKLIST_MUTATION, {
        taskId,
        title,
      }).then((d) => d.deleteChecklist),
    onSuccess: () => {
      void queryClient.refetchQueries({ queryKey: ["task", taskId] });
    },
  });
  return {
    deleteChecklist: (title: string) => mutateAsync(title),
    loading: isPending,
  };
}

export function useRenameChecklist(taskId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({
      oldTitle,
      newTitle,
    }: {
      oldTitle: string;
      newTitle: string;
    }) =>
      gqlMutate<{ renameChecklist: boolean }>(RENAME_CHECKLIST_MUTATION, {
        taskId,
        oldTitle,
        newTitle,
      }).then((d) => d.renameChecklist),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    },
  });
  return {
    renameChecklist: (oldTitle: string, newTitle: string) =>
      mutateAsync({ oldTitle, newTitle }),
    loading: isPending,
  };
}

export function useCreateComment(taskId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (body: string) =>
      gqlMutate<{ createTaskComment: TaskComment }>(CREATE_COMMENT_MUTATION, {
        input: { taskId, body },
      }).then((d) => d.createTaskComment),
    onSuccess: (newComment) => {
      queryClient.setQueryData<TaskDetail>(["task", taskId], (old) =>
        old ? { ...old, comments: [...old.comments, newComment] } : old,
      );
      void queryClient.invalidateQueries({ queryKey: ["task", taskId] });
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
      gqlMutate<{ updateTaskComment: TaskComment }>(UPDATE_COMMENT_MUTATION, {
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
      void queryClient.invalidateQueries({ queryKey: ["task", taskId] });
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
      gqlMutate<{ deleteTaskComment: boolean }>(DELETE_COMMENT_MUTATION, {
        id,
      }).then((d) => d.deleteTaskComment),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<TaskDetail>(["task", taskId], (old) =>
        old
          ? { ...old, comments: old.comments.filter((c) => c.id !== id) }
          : old,
      );
      void queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    },
  });
  return { deleteComment: (id: number) => mutateAsync(id) };
}

export function useCreateTaskLabel(taskId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (input: { name: string; color?: string }) =>
      gqlMutate<{ createTaskLabel: TaskLabel }>(CREATE_TASK_LABEL_MUTATION, {
        input: { taskId, ...input },
      }).then((d) => d.createTaskLabel),
    onSuccess: (newLabel) => {
      queryClient.setQueryData<TaskDetail>(["task", taskId], (old) =>
        old ? { ...old, labels: [...old.labels, newLabel] } : old,
      );
    },
  });
  return {
    createLabel: (input: { name: string; color?: string }) =>
      mutateAsync(input),
    loading: isPending,
  };
}

export function useDeleteTaskLabel(taskId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: (id: number) =>
      gqlMutate<{ deleteTaskLabel: boolean }>(DELETE_TASK_LABEL_MUTATION, {
        id,
      }).then((d) => d.deleteTaskLabel),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<TaskDetail>(["task", taskId], (old) =>
        old ? { ...old, labels: old.labels.filter((l) => l.id !== id) } : old,
      );
    },
  });
  return { deleteLabel: (id: number) => mutateAsync(id) };
}
