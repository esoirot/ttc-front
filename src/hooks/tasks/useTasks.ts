import {
  useMutation,
  useQuery,
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
  TaskConnection,
  TaskDetail,
  TaskComment,
  TaskLabel,
  CreateTaskInput,
  UpdateTaskInput,
  UpdateSubtaskInput,
} from "@/types/tasks.types";
import { gqlFetch, gqlMutate } from "@/lib/apollo";
import { useGqlConnectionQuery } from "@/lib/gqlQuery";
import { useGqlMutation } from "@/lib/gqlMutation";
import {
  patchConnection,
  removeFromConnection,
  patchNestedField,
} from "@/lib/cachePatch";

const LIMIT = 50;

export function useTasks(projectId: number, options?: { enabled?: boolean }) {
  const enabled = (options?.enabled ?? true) && projectId > 0;
  const { items, total, hasMore, loadMore, loading, error } =
    useGqlConnectionQuery({
      queryKey: ["tasks", projectId],
      query: TASKS_QUERY,
      variables: { projectId },
      select: (d) => d.tasks,
      limit: LIMIT,
      enabled,
    });

  return { tasks: items, total, hasMore, loadMore, loading, error };
}

export function useMyTasks() {
  const { items, total, hasMore, loadMore, loading, error } =
    useGqlConnectionQuery({
      queryKey: ["myTasks"],
      query: MY_TASKS_QUERY,
      variables: {},
      select: (d) => d.myTasks,
      limit: LIMIT,
    });

  return { tasks: items, total, hasMore, loadMore, loading, error };
}

export function useTask(id: number, options?: { enabled?: boolean }) {
  const enabled = (options?.enabled ?? true) && !!id;
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["task", id],
    queryFn: () =>
      gqlFetch<{ task: TaskDetail }>(TASK_QUERY, { id }).then((d) => d.task),
    enabled,
  });
  return { task: data ?? null, loading: isLoading, error, refetch };
}

export function useCreateTask(projectId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useGqlMutation({
    mutation: CREATE_TASK_MUTATION,
    unwrap: (d) => d.createTask,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
  return {
    createTask: (input: CreateTaskInput) => mutateAsync({ input }),
    loading: isPending,
    error,
  };
}

export function useUpdateTask(projectId: number) {
  const queryClient = useQueryClient();
  const tasksKey = ["tasks", projectId];
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (input: UpdateTaskInput) =>
      gqlMutate<{ updateTask: Task }>(UPDATE_TASK_MUTATION, { input }).then(
        (d) => d.updateTask,
      ),
    onMutate: async (input) => {
      if (input.status === undefined) return undefined;
      await queryClient.cancelQueries({ queryKey: tasksKey });
      const previous =
        queryClient.getQueryData<InfiniteData<TaskConnection>>(tasksKey);
      queryClient.setQueryData<InfiniteData<TaskConnection>>(tasksKey, (old) =>
        old
          ? {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                items: page.items.map((t) =>
                  t.id === input.id ? { ...t, status: input.status! } : t,
                ),
              })),
            }
          : old,
      );
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(tasksKey, context.previous);
      }
    },
    onSuccess: (updated) => {
      patchConnection(queryClient, tasksKey, updated, (t) => t.id);
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
  const { mutateAsync, isPending, error } = useGqlMutation({
    mutation: DELETE_TASK_MUTATION,
    unwrap: (d) => d.deleteTask,
    onSuccess: (_data, { id }) => {
      removeFromConnection(
        queryClient,
        ["tasks", projectId],
        id,
        (t: Task) => t.id,
      );
      queryClient.removeQueries({ queryKey: ["task", id] });
    },
  });
  return {
    deleteTask: (id: number) => mutateAsync({ id }),
    loading: isPending,
    error,
  };
}

export function useUpdateMyTask() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useGqlMutation({
    mutation: UPDATE_TASK_MUTATION,
    unwrap: (d) => d.updateTask,
    onSuccess: (updated) => {
      patchConnection(queryClient, ["myTasks"], updated, (t) => t.id);
    },
  });
  return {
    updateTask: (input: UpdateTaskInput) => mutateAsync({ input }),
    loading: isPending,
    error,
  };
}

export function useCreateSubtask(taskId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useGqlMutation({
    mutation: CREATE_SUBTASK_MUTATION,
    unwrap: (d) => d.createSubtask,
    onSuccess: () => {
      void queryClient.refetchQueries({ queryKey: ["task", taskId] });
    },
  });
  return {
    createSubtask: (input: {
      checklistTitle?: string;
      title: string;
      dueDate?: string;
    }) => mutateAsync({ input: { taskId, ...input } }),
    loading: isPending,
  };
}

export function useUpdateSubtask(taskId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useGqlMutation({
    mutation: UPDATE_SUBTASK_MUTATION,
    unwrap: (d) => d.updateSubtask,
    onSuccess: () => {
      void queryClient.refetchQueries({ queryKey: ["task", taskId] });
    },
  });
  return {
    updateSubtask: (input: UpdateSubtaskInput) => mutateAsync({ input }),
    loading: isPending,
  };
}

export function useDeleteSubtask(taskId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync } = useGqlMutation({
    mutation: DELETE_SUBTASK_MUTATION,
    unwrap: (d) => d.deleteSubtask,
    onSuccess: () => {
      void queryClient.refetchQueries({ queryKey: ["task", taskId] });
    },
  });
  return { deleteSubtask: (id: number) => mutateAsync({ id }) };
}

export function useCreateChecklist(taskId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useGqlMutation({
    mutation: CREATE_CHECKLIST_MUTATION,
    unwrap: (d) => d.createChecklist,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    },
  });
  return {
    createChecklist: (title: string) => mutateAsync({ taskId, title }),
    loading: isPending,
  };
}

export function useDeleteChecklist(taskId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useGqlMutation({
    mutation: DELETE_CHECKLIST_MUTATION,
    unwrap: (d) => d.deleteChecklist,
    onSuccess: () => {
      void queryClient.refetchQueries({ queryKey: ["task", taskId] });
    },
  });
  return {
    deleteChecklist: (title: string) => mutateAsync({ taskId, title }),
    loading: isPending,
  };
}

export function useRenameChecklist(taskId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useGqlMutation({
    mutation: RENAME_CHECKLIST_MUTATION,
    unwrap: (d) => d.renameChecklist,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    },
  });
  return {
    renameChecklist: (oldTitle: string, newTitle: string) =>
      mutateAsync({ taskId, oldTitle, newTitle }),
    loading: isPending,
  };
}

export function useCreateComment(taskId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useGqlMutation({
    mutation: CREATE_COMMENT_MUTATION,
    unwrap: (d) => d.createTaskComment,
    onSuccess: (newComment) => {
      patchNestedField<TaskDetail, TaskComment>(
        queryClient,
        ["task", taskId],
        "comments",
        newComment,
        (c) => c.id,
        "add",
      );
      void queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    },
  });
  return {
    createComment: (body: string) => mutateAsync({ input: { taskId, body } }),
    loading: isPending,
  };
}

export function useUpdateComment(taskId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useGqlMutation({
    mutation: UPDATE_COMMENT_MUTATION,
    unwrap: (d) => d.updateTaskComment,
    onSuccess: (updated) => {
      patchNestedField<TaskDetail, TaskComment>(
        queryClient,
        ["task", taskId],
        "comments",
        updated,
        (c) => c.id,
        "upsert",
      );
      void queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    },
  });
  return {
    updateComment: (input: { id: number; body: string }) =>
      mutateAsync({ input }),
    loading: isPending,
  };
}

export function useDeleteComment(taskId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync } = useGqlMutation({
    mutation: DELETE_COMMENT_MUTATION,
    unwrap: (d) => d.deleteTaskComment,
    onSuccess: (_data, { id }) => {
      queryClient.setQueryData<TaskDetail>(["task", taskId], (old) =>
        old
          ? { ...old, comments: old.comments.filter((c) => c.id !== id) }
          : old,
      );
      void queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    },
  });
  return { deleteComment: (id: number) => mutateAsync({ id }) };
}

export function useCreateTaskLabel(taskId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useGqlMutation({
    mutation: CREATE_TASK_LABEL_MUTATION,
    unwrap: (d) => d.createTaskLabel,
    onSuccess: (newLabel) => {
      patchNestedField<TaskDetail, TaskLabel>(
        queryClient,
        ["task", taskId],
        "labels",
        newLabel,
        (l) => l.id,
        "add",
      );
    },
  });
  return {
    createLabel: (input: { name: string; color?: string }) =>
      mutateAsync({ input: { taskId, ...input } }),
    loading: isPending,
  };
}

export function useDeleteTaskLabel(taskId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync } = useGqlMutation({
    mutation: DELETE_TASK_LABEL_MUTATION,
    unwrap: (d) => d.deleteTaskLabel,
    onSuccess: (_data, { id }) => {
      queryClient.setQueryData<TaskDetail>(["task", taskId], (old) =>
        old ? { ...old, labels: old.labels.filter((l) => l.id !== id) } : old,
      );
    },
  });
  return { deleteLabel: (id: number) => mutateAsync({ id }) };
}
