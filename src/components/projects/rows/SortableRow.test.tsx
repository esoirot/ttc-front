import { fireEvent, render, screen } from "@testing-library/react";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";
import { messages } from "@/i18n/messages";
import type { Task } from "@/types/tasks.types";
import { SortableRow } from "./SortableRow";

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

function renderRow(props: Partial<Parameters<typeof SortableRow>[0]> = {}) {
  const task = props.task ?? makeTask();
  return render(
    <IntlProvider locale="en" messages={messages.en}>
      <DndContext>
        <SortableContext items={[task.id]}>
          <SortableRow
            task={task}
            selected={false}
            onSelect={vi.fn()}
            onOpenModal={vi.fn()}
            onDelete={vi.fn()}
            {...props}
          />
        </SortableContext>
      </DndContext>
    </IntlProvider>,
  );
}

describe("SortableRow", () => {
  it("shows the title and status label", () => {
    renderRow();
    expect(screen.getByText("Translate doc")).toBeInTheDocument();
    expect(screen.getByText("Todo")).toBeInTheDocument();
  });

  it("shows the due date as DD/MM/YYYY when set", () => {
    renderRow({ task: makeTask({ dueDate: "2026-07-01T00:00:00.000Z" }) });
    expect(screen.getByText("Due 01/07/2026")).toBeInTheDocument();
  });

  it("calls onOpenModal with the task id when the row is clicked", () => {
    const onOpenModal = vi.fn();
    renderRow({ task: makeTask({ id: 9 }), onOpenModal });
    fireEvent.click(screen.getByText("Translate doc"));
    expect(onOpenModal).toHaveBeenCalledWith(9);
  });

  it("calls onSelect with the checked state", () => {
    const onSelect = vi.fn();
    renderRow({ task: makeTask({ id: 5 }), onSelect });
    fireEvent.click(screen.getByLabelText("Select Translate doc"));
    expect(onSelect).toHaveBeenCalledWith(5, true);
  });

  it("calls onDelete after confirming the delete dialog", () => {
    const onDelete = vi.fn();
    renderRow({ task: makeTask({ id: 3 }), onDelete });
    fireEvent.click(screen.getByText("✕"));
    fireEvent.click(screen.getByText("Delete"));
    expect(onDelete).toHaveBeenCalledWith(3);
  });
});
