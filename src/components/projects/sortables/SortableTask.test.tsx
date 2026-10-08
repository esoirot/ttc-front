import { fireEvent, render, screen } from "@testing-library/react";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { IntlProvider } from "react-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/useLocale";
import type { Task } from "@/types/tasks.types";
import { SortableTask } from "./SortableTask";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    projectId: 1,
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

function renderTask(
  props: Partial<Parameters<typeof SortableTask>[0]> = {},
  locale: Locale = "en",
) {
  const task = props.task ?? makeTask();
  return render(
    <IntlProvider locale={locale} messages={messages[locale]}>
      <DndContext>
        <SortableContext items={[task.id]}>
          <SortableTask
            task={task}
            onDelete={vi.fn()}
            onOpenModal={vi.fn()}
            {...props}
          />
        </SortableContext>
      </DndContext>
    </IntlProvider>,
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

  it("renders French copy when locale is fr", () => {
    renderTask({ task: makeTask({ id: 6 }) }, "fr");
    fireEvent.click(screen.getByLabelText("Supprimer la tâche"));
    expect(screen.getByText("Supprimer la tâche ?")).toBeInTheDocument();
  });
});
