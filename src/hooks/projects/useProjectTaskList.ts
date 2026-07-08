import { useState } from "react";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from "@/hooks/tasks/useTasks";
import type { TaskStatus } from "@/types/tasks.types";

export function useProjectTaskList({ projectId }: { projectId: number }) {
  const { tasks, loading, hasMore, loadMore } = useTasks(projectId);
  const { createTask, loading: createLoading } = useCreateTask(projectId);
  const { updateTask } = useUpdateTask(projectId);
  const { deleteTask } = useDeleteTask(projectId);

  const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL");

  return {
    tasks,
    loading,
    hasMore,
    loadMore,
    createLoading,
    createTask,
    deleteTask,
    updateTask,
    statusFilter,
    setStatusFilter,
  };
}
