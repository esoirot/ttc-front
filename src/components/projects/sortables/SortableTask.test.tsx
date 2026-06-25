import { fireEvent, render, screen } from "@testing-library/react";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Task } from "@/types/tasks.types";
import { SortableTask } from "./SortableTask";

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

function renderTask(props: Partial<Parameters<typeof SortableTask>[0]> = {}) {
  const task = props.task ?? makeTask();
  return render(
    <DndContext>
      <SortableContext items={[task.id]}>
        <SortableTask
          task={task}
          onStatusChange={vi.fn()}
          onDelete={vi.fn()}
          onOpenModal={vi.fn()}
          memberMap={{}}
          members={[]}
          {...props}
        />
      </SortableContext>
    </DndContext>,
  );
}

describe("SortableTask", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-17T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the title", () => {
    renderTask();
    expect(screen.getByText("Translate doc")).toBeInTheDocument();
  });

  it("shows the assignee when mapped", () => {
    renderTask({
      task: makeTask({ assigneeId: 3 }),
      memberMap: { 3: "Alice" },
    });
    expect(screen.getByText("@Alice")).toBeInTheDocument();
  });

  it("marks a past due date as overdue", () => {
    renderTask({ task: makeTask({ dueDate: "2026-06-01T00:00:00.000Z" }) });
    expect(screen.getByText("2026-06-01")).toHaveClass("text-destructive");
  });

  it("does not mark a future due date as overdue", () => {
    renderTask({ task: makeTask({ dueDate: "2026-07-01T00:00:00.000Z" }) });
    expect(screen.getByText("2026-07-01")).toHaveClass("text-muted-foreground");
  });

  it("calls onOpenModal when the card is clicked", () => {
    const onOpenModal = vi.fn();
    renderTask({ task: makeTask({ id: 8 }), onOpenModal });
    fireEvent.click(screen.getByText("Translate doc"));
    expect(onOpenModal).toHaveBeenCalledWith(8);
  });

  it("calls onDelete after confirming the delete dialog", () => {
    const onDelete = vi.fn();
    renderTask({ task: makeTask({ id: 6 }), onDelete });
    fireEvent.click(screen.getByLabelText("Delete task"));
    fireEvent.click(screen.getByText("Delete"));
    expect(onDelete).toHaveBeenCalledWith(6);
  });
});
