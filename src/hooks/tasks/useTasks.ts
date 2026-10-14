import {
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import {
  TASKS_QUERY,
  TASK_QUERY,
  CREATE_TASK_MUTATION,
  UPDATE_TASK_MUTATION,
  MOVE_TASK_MUTATION,
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
  TaskStatus,
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
import { reloadWhereShown } from "@/lib/cacheDeps";
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

/** First tasks of a project matching `search` for a picker; searched on the server. */
export function useTaskOptions(
  projectId: number,
  search: string,
  enabled: boolean,
) {
  const { items, loading } = useGqlConnectionQuery({
    queryKey: ["tasks", projectId, { options: true, search }],
    query: TASKS_QUERY,
    variables: { projectId, ...(search ? { search } : {}) },
    select: (d) => d.tasks,
    limit: LIMIT,
    enabled: enabled && projectId > 0,
  });
  return { tasks: items, loading };
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

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useGqlMutation({
    mutation: CREATE_TASK_MUTATION,
    unwrap: (d) => d.createTask,
    onSuccess: () => reloadWhereShown(queryClient, "task"),
  });
  return {
    createTask: (input: CreateTaskInput) => mutateAsync({ input }),
    loading: isPending,
    error,
  };
}

/** Optimistically shows a task in its new column; returns the cache to roll back to. */
async function showInColumn(
  queryClient: ReturnType<typeof useQueryClient>,
  tasksKey: unknown[],
  id: number,
  status: TaskStatus,
) {
  await queryClient.cancelQueries({ queryKey: tasksKey });
  const previous =
    queryClient.getQueryData<InfiniteData<TaskConnection>>(tasksKey);
  queryClient.setQueryData<InfiniteData<TaskConnection>>(tasksKey, (old) =>
    old
      ? {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: page.items.map((t) => (t.id === id ? { ...t, status } : t)),
          })),
        }
      : old,
  );
  return { previous };
}

/** Drops a task at `position` in the `status` column (kanban drag and drop). */
export function useMoveTask(projectId: number) {
  const queryClient = useQueryClient();
  const tasksKey = ["tasks", projectId];
  const { mutateAsync } = useMutation({
    mutationFn: (input: { id: number; status: TaskStatus; position: number }) =>
      gqlMutate<{ moveTask: Task }>(MOVE_TASK_MUTATION, { input }).then(
        (d) => d.moveTask,
      ),
    onMutate: (input) =>
      showInColumn(queryClient, tasksKey, input.id, input.status),
    onError: (_err, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(tasksKey, context.previous);
      }
    },
    // The server renumbered both columns: reload them.
    onSettled: () => reloadWhereShown(queryClient, "task"),
  });
  return {
    moveTask: (input: { id: number; status: TaskStatus; position: number }) =>
      mutateAsync(input),
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
    onMutate: (input) =>
      input.status === undefined
        ? undefined
        : showInColumn(queryClient, tasksKey, input.id, input.status),
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
      reloadWhereShown(queryClient, "task");
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
      reloadWhereShown(queryClient, "task");
    },
  });
  return {
    deleteTask: (id: number) => mutateAsync({ id }),
    loading: isPending,
    error,
  };
}

export function useCreateSubtask(taskId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useGqlMutation({
    mutation: CREATE_SUBTASK_MUTATION,
    unwrap: (d) => d.createSubtask,
    onSuccess: () => reloadWhereShown(queryClient, "task"),
  });
  return {
    createSubtask: (input: {
      checklistTitle?: string;
      title: string;
      dueDate?: string;
      wordCount?: number | null;
      countInTotal?: boolean;
    }) => mutateAsync({ input: { taskId, ...input } }),
    loading: isPending,
  };
}

export function useUpdateSubtask() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useGqlMutation({
    mutation: UPDATE_SUBTASK_MUTATION,
    unwrap: (d) => d.updateSubtask,
    onSuccess: () => reloadWhereShown(queryClient, "task"),
  });
  return {
    updateSubtask: (input: UpdateSubtaskInput) => mutateAsync({ input }),
    loading: isPending,
  };
}

export function useDeleteSubtask() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useGqlMutation({
    mutation: DELETE_SUBTASK_MUTATION,
    unwrap: (d) => d.deleteSubtask,
    onSuccess: () => reloadWhereShown(queryClient, "task"),
  });
  return { deleteSubtask: (id: number) => mutateAsync({ id }) };
}

export function useCreateChecklist(taskId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useGqlMutation({
    mutation: CREATE_CHECKLIST_MUTATION,
    unwrap: (d) => d.createChecklist,
    onSuccess: () => reloadWhereShown(queryClient, "task"),
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
    onSuccess: () => reloadWhereShown(queryClient, "task"),
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
    onSuccess: () => reloadWhereShown(queryClient, "task"),
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
      reloadWhereShown(queryClient, "taskDetail");
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
      reloadWhereShown(queryClient, "taskDetail");
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
      reloadWhereShown(queryClient, "taskDetail");
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
      reloadWhereShown(queryClient, "taskDetail");
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
      reloadWhereShown(queryClient, "taskDetail");
    },
  });
  return { deleteLabel: (id: number) => mutateAsync({ id }) };
}
