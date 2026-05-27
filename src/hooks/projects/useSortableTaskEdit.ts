import { useState } from "react";
import type { Task } from "@/types/tasks.types";

export function useSortableTaskEdit(
  task: Task,
  onUpdate: (id: number, assigneeId?: number, dueDate?: string) => void,
) {
  const [editing, setEditing] = useState(false);
  const [editAssigneeId, setEditAssigneeId] = useState(
    String(task.assigneeId ?? ""),
  );
  const [editDueDate, setEditDueDate] = useState(
    task.dueDate?.slice(0, 10) ?? "",
  );

  function handleStartEdit() {
    setEditAssigneeId(String(task.assigneeId ?? ""));
    setEditDueDate(task.dueDate?.slice(0, 10) ?? "");
    setEditing(true);
  }

  function handleSave() {
    onUpdate(
      task.id,
      editAssigneeId ? Number(editAssigneeId) : undefined,
      editDueDate || undefined,
    );
    setEditing(false);
  }

  return {
    editing,
    setEditing,
    editAssigneeId,
    setEditAssigneeId,
    editDueDate,
    setEditDueDate,
    handleStartEdit,
    handleSave,
  };
}
