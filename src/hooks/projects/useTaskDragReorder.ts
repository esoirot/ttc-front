import { useState } from "react";
import { useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { Task } from "@/types/tasks.types";

export function useTaskDragReorder(
  tasks: Task[],
  onReorder: (id: number, sortOrder: number) => void,
) {
  const [localOrder, setLocalOrder] = useState<number[] | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  const displayTasks = localOrder
    ? localOrder
        .map((id) => tasks.find((t) => t.id === id))
        .filter((t): t is Task => t !== undefined)
    : tasks;

  function handleDragEnd(event: DragEndEvent, visibleIds: number[]) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = visibleIds.indexOf(active.id as number);
    const newIndex = visibleIds.indexOf(over.id as number);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(visibleIds, oldIndex, newIndex);
    const allIds = tasks.map((t) => t.id);
    setLocalOrder(
      reordered.concat(allIds.filter((id) => !reordered.includes(id))),
    );

    onReorder(active.id as number, newIndex);
  }

  return { displayTasks, sensors, handleDragEnd };
}
