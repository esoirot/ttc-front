import { useQuery, useMutation } from "@apollo/client/react";
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
  type Task,
  type TaskDetail,
  type TaskStatus,
  type TaskConnection,
  type Subtask,
  type TaskComment,
} from "../../graphql/tasks.operations";

export type {
  Task,
  TaskDetail,
  TaskStatus,
  TaskConnection,
  Subtask,
  TaskComment,
};

const LIMIT = 50;

export function useTasks(projectId: number) {
  const baseVars = { projectId, pagination: { limit: LIMIT } };

  const { data, fetchMore, loading, error } = useQuery(TASKS_QUERY, {
    variables: baseVars,
  });

  const nextCursor = data?.tasks.nextCursor ?? null;

  function loadMore() {
    void fetchMore({
      variables: {
        ...baseVars,
        pagination: { limit: LIMIT, cursor: nextCursor ?? undefined },
      },
      updateQuery(prev, { fetchMoreResult }) {
        if (!fetchMoreResult) return prev;
        return {
          tasks: {
            ...fetchMoreResult.tasks,
            items: [...prev.tasks.items, ...fetchMoreResult.tasks.items],
          },
        };
      },
    });
  }

  return {
    tasks: data?.tasks.items ?? [],
    total: data?.tasks.total ?? 0,
    hasMore: nextCursor !== null,
    loadMore,
    loading,
    error,
  };
}

export function useMyTasks() {
  const baseVars = { pagination: { limit: LIMIT } };
  const { data, fetchMore, loading, error } = useQuery(MY_TASKS_QUERY, {
    variables: baseVars,
  });
  const nextCursor = data?.myTasks.nextCursor ?? null;

  function loadMore() {
    void fetchMore({
      variables: {
        ...baseVars,
        pagination: { limit: LIMIT, cursor: nextCursor ?? undefined },
      },
      updateQuery(prev, { fetchMoreResult }) {
        if (!fetchMoreResult) return prev;
        return {
          myTasks: {
            ...fetchMoreResult.myTasks,
            items: [...prev.myTasks.items, ...fetchMoreResult.myTasks.items],
          },
        };
      },
    });
  }

  return {
    tasks: data?.myTasks.items ?? [],
    total: data?.myTasks.total ?? 0,
    hasMore: nextCursor !== null,
    loadMore,
    loading,
    error,
  };
}

export function useCreateTask(projectId: number) {
  const [mutate, { loading, error }] = useMutation(CREATE_TASK_MUTATION, {
    refetchQueries: [
      {
        query: TASKS_QUERY,
        variables: { projectId, pagination: { limit: LIMIT } },
      },
    ],
  });
  return {
    createTask: (input: Parameters<typeof mutate>[0]["variables"]["input"]) =>
      mutate({ variables: { input } }),
    loading,
    error,
  };
}

export function useUpdateTask(projectId: number) {
  const [mutate, { loading, error }] = useMutation(UPDATE_TASK_MUTATION, {
    refetchQueries: [
      {
        query: TASKS_QUERY,
        variables: { projectId, pagination: { limit: LIMIT } },
      },
    ],
  });
  return {
    updateTask: (input: Parameters<typeof mutate>[0]["variables"]["input"]) =>
      mutate({ variables: { input } }),
    loading,
    error,
  };
}

export function useDeleteTask(projectId: number) {
  const [mutate, { loading, error }] = useMutation(DELETE_TASK_MUTATION, {
    refetchQueries: [
      {
        query: TASKS_QUERY,
        variables: { projectId, pagination: { limit: LIMIT } },
      },
    ],
  });
  return {
    deleteTask: (id: number) => mutate({ variables: { id } }),
    loading,
    error,
  };
}

export function useUpdateMyTask() {
  const [mutate, { loading, error }] = useMutation(UPDATE_TASK_MUTATION, {
    refetchQueries: [
      { query: MY_TASKS_QUERY, variables: { pagination: { limit: LIMIT } } },
    ],
  });
  return {
    updateTask: (input: Parameters<typeof mutate>[0]["variables"]["input"]) =>
      mutate({ variables: { input } }),
    loading,
    error,
  };
}

export function useTask(id: number) {
  const { data, loading, error, refetch } = useQuery(TASK_QUERY, {
    variables: { id },
    skip: !id,
  });
  return { task: data?.task ?? null, loading, error, refetch };
}

export function useCreateSubtask(taskId: number) {
  const [mutate, { loading }] = useMutation(CREATE_SUBTASK_MUTATION, {
    refetchQueries: [{ query: TASK_QUERY, variables: { id: taskId } }],
  });
  return {
    createSubtask: (title: string) =>
      mutate({ variables: { input: { taskId, title } } }),
    loading,
  };
}

export function useUpdateSubtask(taskId: number) {
  const [mutate, { loading }] = useMutation(UPDATE_SUBTASK_MUTATION, {
    refetchQueries: [{ query: TASK_QUERY, variables: { id: taskId } }],
  });
  return {
    updateSubtask: (input: { id: number; title?: string; done?: boolean }) =>
      mutate({ variables: { input } }),
    loading,
  };
}

export function useDeleteSubtask(taskId: number) {
  const [mutate] = useMutation(DELETE_SUBTASK_MUTATION, {
    refetchQueries: [{ query: TASK_QUERY, variables: { id: taskId } }],
  });
  return {
    deleteSubtask: (id: number) => mutate({ variables: { id } }),
  };
}

export function useCreateComment(taskId: number) {
  const [mutate, { loading }] = useMutation(CREATE_COMMENT_MUTATION, {
    refetchQueries: [{ query: TASK_QUERY, variables: { id: taskId } }],
  });
  return {
    createComment: (body: string) =>
      mutate({ variables: { input: { taskId, body } } }),
    loading,
  };
}

export function useUpdateComment(taskId: number) {
  const [mutate, { loading }] = useMutation(UPDATE_COMMENT_MUTATION, {
    refetchQueries: [{ query: TASK_QUERY, variables: { id: taskId } }],
  });
  return {
    updateComment: (input: { id: number; body: string }) =>
      mutate({ variables: { input } }),
    loading,
  };
}

export function useDeleteComment(taskId: number) {
  const [mutate] = useMutation(DELETE_COMMENT_MUTATION, {
    refetchQueries: [{ query: TASK_QUERY, variables: { id: taskId } }],
  });
  return {
    deleteComment: (id: number) => mutate({ variables: { id } }),
  };
}
