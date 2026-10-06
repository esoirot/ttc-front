import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createIntlWrapper } from "@/test/intlWrapper";

const IntlWrapper = createIntlWrapper();

const useProjectTaskListMock = vi.fn();
vi.mock("@/hooks/projects/useProjectTaskList", () => ({
  useProjectTaskList: (...args: unknown[]) => useProjectTaskListMock(...args),
}));

const useTaskDragReorderMock = vi.fn();
vi.mock("@/hooks/projects/useTaskDragReorder", () => ({
  useTaskDragReorder: (...args: unknown[]) => useTaskDragReorderMock(...args),
}));

let dndOnDragEnd: ((e: unknown) => void) | undefined;
vi.mock("@dnd-kit/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@dnd-kit/core")>();
  return {
    ...actual,
    DndContext: (props: React.ComponentProps<typeof actual.DndContext>) => {
      dndOnDragEnd = props.onDragEnd as (e: unknown) => void;
      return <actual.DndContext {...props} />;
    },
  };
});

let sortableRowProps: Record<string, unknown>[] = [];
vi.mock("../rows/SortableRow", () => ({
  SortableRow: (props: Record<string, unknown>) => {
    sortableRowProps.push(props);
    const task = props.task as { id: number; title: string };
    return (
      <div data-testid="sortable-row">
        {task.title}
        <button
          onClick={() =>
            (props.onSelect as (id: number, checked: boolean) => void)(
              task.id,
              true,
            )
          }
        >
          select-{task.id}
        </button>
      </div>
    );
  },
}));

import type { Task } from "@/types/tasks.types";
import { ProjectTaskList } from "./ProjectTaskList";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    projectId: 1,
    assigneeId: null,
    title: "Translate doc",
    description: null,
    status: "TODO",
    dueDate: null,
    wordCount: null,
    startDate: null,
    recurring: null,
    reminderOffset: null,
    sortOrder: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function hookState(overrides: Record<string, unknown> = {}) {
  return {
    tasks: [],
    loading: false,
    hasMore: false,
    loadMore: vi.fn(),
    createLoading: false,
    createTask: vi.fn(),
    deleteTask: vi.fn(),
    updateTask: vi.fn(),
    statusFilter: "ALL",
    setStatusFilter: vi.fn(),
    ...overrides,
  };
}

function dragState(overrides: Record<string, unknown> = {}) {
  return {
    displayTasks: [],
    sensors: [],
    handleDragEnd: vi.fn(),
    ...overrides,
  };
}

function renderList(onOpenModal = vi.fn()) {
  return render(
    <ProjectTaskList projectId={1} members={[]} onOpenModal={onOpenModal} />,
    { wrapper: IntlWrapper },
  );
}

describe("ProjectTaskList", () => {
  beforeEach(() => {
    useProjectTaskListMock.mockReset();
    useTaskDragReorderMock.mockReset();
    sortableRowProps = [];
    useProjectTaskListMock.mockReturnValue(hookState());
    useTaskDragReorderMock.mockReturnValue(dragState());
  });

  it("shows skeletons while loading", () => {
    useProjectTaskListMock.mockReturnValue(hookState({ loading: true }));
    const { container } = renderList();

    expect(
      container.querySelectorAll('[class*="animate-pulse"]').length,
    ).toBeGreaterThan(0);
  });

  it("shows 'No tasks.' when there are no tasks and not loading", () => {
    renderList();

    expect(screen.getByText("No tasks.")).toBeInTheDocument();
  });

  it("renders a SortableRow per displayed task", () => {
    useTaskDragReorderMock.mockReturnValue(
      dragState({
        displayTasks: [
          makeTask({ id: 1, title: "A" }),
          makeTask({ id: 2, title: "B" }),
        ],
      }),
    );
    renderList();

    expect(screen.getAllByTestId("sortable-row")).toHaveLength(2);
  });

  it("statusFilter narrows the rendered rows to matching tasks", () => {
    useProjectTaskListMock.mockReturnValue(hookState({ statusFilter: "DONE" }));
    useTaskDragReorderMock.mockReturnValue(
      dragState({
        displayTasks: [
          makeTask({ id: 1, title: "A", status: "TODO" }),
          makeTask({ id: 2, title: "B", status: "DONE" }),
        ],
      }),
    );
    renderList();

    expect(screen.getAllByTestId("sortable-row")).toHaveLength(1);
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("shows the due date filter inputs", () => {
    renderList();
    expect(screen.getByLabelText("Due from")).toBeInTheDocument();
    expect(screen.getByLabelText("Due to")).toBeInTheDocument();
  });

  it("hides tasks whose due date falls outside the from/to range", () => {
    useTaskDragReorderMock.mockReturnValue(
      dragState({
        displayTasks: [
          makeTask({
            id: 1,
            title: "Early",
            dueDate: "2026-01-05T00:00:00.000Z",
          }),
          makeTask({
            id: 2,
            title: "Late",
            dueDate: "2026-03-05T00:00:00.000Z",
          }),
        ],
      }),
    );
    renderList();

    fireEvent.change(screen.getByLabelText("Due from"), {
      target: { value: "2026-02-01" },
    });

    expect(screen.queryByText("Early")).not.toBeInTheDocument();
    expect(screen.getByText("Late")).toBeInTheDocument();
  });

  it("hides tasks with no due date once a due date filter is active", () => {
    useTaskDragReorderMock.mockReturnValue(
      dragState({
        displayTasks: [
          makeTask({ id: 1, title: "No due date", dueDate: null }),
          makeTask({
            id: 2,
            title: "Has due date",
            dueDate: "2026-01-05T00:00:00.000Z",
          }),
        ],
      }),
    );
    renderList();

    fireEvent.change(screen.getByLabelText("Due from"), {
      target: { value: "2026-01-01" },
    });

    expect(screen.queryByText("No due date")).not.toBeInTheDocument();
    expect(screen.getByText("Has due date")).toBeInTheDocument();
  });

  it("shows the due date sort option", () => {
    renderList();
    expect(screen.getByLabelText("Sort")).toBeInTheDocument();
  });

  it("orders tasks by due date (latest first, undated last) by default", () => {
    useTaskDragReorderMock.mockReturnValue(
      dragState({
        displayTasks: [
          makeTask({ id: 1, title: "No due date", dueDate: null }),
          makeTask({
            id: 2,
            title: "Due later",
            dueDate: "2026-05-01T00:00:00.000Z",
          }),
          makeTask({
            id: 3,
            title: "Due soonest",
            dueDate: "2026-01-01T00:00:00.000Z",
          }),
        ],
      }),
    );
    renderList();

    const order = screen
      .getAllByText(/^select-\d$/)
      .map((el) => el.textContent);
    expect(order).toEqual(["select-2", "select-3", "select-1"]);
  });

  it("sorts tasks by due date (latest first, undated last) when Due date sort is chosen explicitly", () => {
    useTaskDragReorderMock.mockReturnValue(
      dragState({
        displayTasks: [
          makeTask({ id: 1, title: "No due date", dueDate: null }),
          makeTask({
            id: 2,
            title: "Due later",
            dueDate: "2026-05-01T00:00:00.000Z",
          }),
          makeTask({
            id: 3,
            title: "Due soonest",
            dueDate: "2026-01-01T00:00:00.000Z",
          }),
        ],
      }),
    );
    renderList();

    fireEvent.click(screen.getByLabelText("Sort"));
    fireEvent.click(screen.getByRole("option", { name: "Due date" }));

    const order = screen
      .getAllByText(/^select-\d$/)
      .map((el) => el.textContent);
    expect(order).toEqual(["select-2", "select-3", "select-1"]);
  });

  it("sorts tasks alphabetically by title when Task name + Ascending is chosen", () => {
    useTaskDragReorderMock.mockReturnValue(
      dragState({
        displayTasks: [
          makeTask({ id: 1, title: "Zebra task" }),
          makeTask({ id: 2, title: "apple task" }),
          makeTask({ id: 3, title: "Mango task" }),
        ],
      }),
    );
    renderList();

    fireEvent.click(screen.getByLabelText("Sort"));
    fireEvent.click(screen.getByRole("option", { name: "Task name" }));
    fireEvent.click(screen.getByLabelText("Order"));
    fireEvent.click(screen.getByRole("option", { name: "Ascending" }));

    const order = screen
      .getAllByText(/^select-\d$/)
      .map((el) => el.textContent);
    expect(order).toEqual(["select-2", "select-3", "select-1"]);
  });

  it("sorts tasks in reverse alphabetical order when Task name + Descending is chosen", () => {
    useTaskDragReorderMock.mockReturnValue(
      dragState({
        displayTasks: [
          makeTask({ id: 1, title: "Zebra task" }),
          makeTask({ id: 2, title: "apple task" }),
          makeTask({ id: 3, title: "Mango task" }),
        ],
      }),
    );
    renderList();

    fireEvent.click(screen.getByLabelText("Sort"));
    fireEvent.click(screen.getByRole("option", { name: "Task name" }));

    const order = screen
      .getAllByText(/^select-\d$/)
      .map((el) => el.textContent);
    expect(order).toEqual(["select-1", "select-3", "select-2"]);
  });

  it("clears the due date filter when Clear filter is clicked", () => {
    useTaskDragReorderMock.mockReturnValue(
      dragState({
        displayTasks: [
          makeTask({
            id: 1,
            title: "Early",
            dueDate: "2026-01-05T00:00:00.000Z",
          }),
          makeTask({
            id: 2,
            title: "Late",
            dueDate: "2026-03-05T00:00:00.000Z",
          }),
        ],
      }),
    );
    renderList();

    fireEvent.change(screen.getByLabelText("Due from"), {
      target: { value: "2026-02-01" },
    });
    expect(screen.queryByText("Early")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Clear filter"));

    expect(screen.getByText("Early")).toBeInTheDocument();
    expect(screen.getByText("Late")).toBeInTheDocument();
  });

  it("shows a 'Task list' heading with the New task button beside it, outside the filters", () => {
    // given the project task list
    renderList();

    // then a heading titles the list
    const heading = screen.getByRole("heading", { name: "Task list" });
    // and the New task button shares the heading row, not the filter toolbar
    const row = heading.parentElement!;
    expect(
      within(row).getByRole("button", { name: "+ New task" }),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("toolbar", { name: "Task filters" })).queryByRole(
        "button",
        { name: "+ New task" },
      ),
    ).not.toBeInTheDocument();
  });

  it("titles the list 'Liste des tâches' in French", () => {
    // given the French locale
    render(
      <ProjectTaskList projectId={1} members={[]} onOpenModal={vi.fn()} />,
      { wrapper: createIntlWrapper("fr") },
    );

    // then the heading is translated
    expect(
      screen.getByRole("heading", { name: "Liste des tâches" }),
    ).toBeInTheDocument();
  });

  it("shows the new task form above the filters", () => {
    // given the project task list
    renderList();

    // when the user opens the create form
    fireEvent.click(screen.getByText("+ New task"));

    // then the form comes before the filter toolbar
    const form = screen.getByLabelText("Title");
    const toolbar = screen.getByRole("toolbar", { name: "Task filters" });
    expect(
      form.compareDocumentPosition(toolbar) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("toggles the create form via '+ New task'", () => {
    renderList();

    expect(screen.queryByLabelText("Title")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("+ New task"));
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
  });

  it("create form: typing updates the title, Enter calls createTask", () => {
    const createTask = vi.fn().mockResolvedValue(undefined);
    useProjectTaskListMock.mockReturnValue(hookState({ createTask }));
    renderList();

    fireEvent.click(screen.getByText("+ New task"));
    const input = screen.getByLabelText("Title");
    fireEvent.change(input, { target: { value: "New task" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(createTask).toHaveBeenCalledWith({
      projectId: 1,
      title: "New task",
    });
  });

  it("create form: Escape clears the title and hides the form", () => {
    renderList();

    fireEvent.click(screen.getByText("+ New task"));
    const input = screen.getByLabelText("Title");
    fireEvent.change(input, { target: { value: "Draft" } });
    fireEvent.keyDown(input, { key: "Escape" });

    expect(screen.queryByLabelText("Title")).not.toBeInTheDocument();
  });

  it("Create button disabled when title is blank or createLoading is true", () => {
    const { rerender } = renderList();
    fireEvent.click(screen.getByText("+ New task"));
    expect(screen.getByRole("button", { name: "Create" })).toBeDisabled();

    useProjectTaskListMock.mockReturnValue(hookState({ createLoading: true }));
    rerender(
      <ProjectTaskList projectId={1} members={[]} onOpenModal={vi.fn()} />,
    );
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "X" },
    });
    expect(screen.getByRole("button", { name: "Creating…" })).toBeDisabled();
  });

  it("Cancel in the create form clears the title and hides it", () => {
    renderList();

    fireEvent.click(screen.getByText("+ New task"));
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Draft" },
    });
    fireEvent.click(screen.getByText("Cancel"));

    expect(screen.queryByLabelText("Title")).not.toBeInTheDocument();
  });

  it("shows the bulk action bar only once a row is selected", () => {
    useTaskDragReorderMock.mockReturnValue(
      dragState({ displayTasks: [makeTask({ id: 1, title: "A" })] }),
    );
    renderList();

    expect(screen.queryByText("Set status")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("select-1"));

    expect(screen.getByText("1 selected")).toBeInTheDocument();
    expect(screen.getByText("Set status")).toBeInTheDocument();
    expect(screen.getByText("Delete selected")).toBeInTheDocument();
  });

  it("'Set status' calls updateTask for each selected id and clears the selection", async () => {
    const updateTask = vi.fn().mockResolvedValue(undefined);
    useProjectTaskListMock.mockReturnValue(hookState({ updateTask }));
    useTaskDragReorderMock.mockReturnValue(
      dragState({
        displayTasks: [
          makeTask({ id: 1, title: "A" }),
          makeTask({ id: 2, title: "B" }),
        ],
      }),
    );
    renderList();

    fireEvent.click(screen.getByText("select-1"));
    fireEvent.click(screen.getByText("select-2"));
    fireEvent.click(screen.getByText("Set status"));

    await vi.waitFor(() => expect(updateTask).toHaveBeenCalledTimes(2));
    expect(updateTask).toHaveBeenCalledWith({ id: 1, status: "TODO" });
    expect(updateTask).toHaveBeenCalledWith({ id: 2, status: "TODO" });
    await vi.waitFor(() =>
      expect(screen.queryByText("Set status")).not.toBeInTheDocument(),
    );
  });

  it("confirming 'Delete selected' calls deleteTask for each selected id and clears the selection", async () => {
    const deleteTask = vi.fn().mockResolvedValue(undefined);
    useProjectTaskListMock.mockReturnValue(hookState({ deleteTask }));
    useTaskDragReorderMock.mockReturnValue(
      dragState({
        displayTasks: [
          makeTask({ id: 1, title: "A" }),
          makeTask({ id: 2, title: "B" }),
        ],
      }),
    );
    renderList();

    fireEvent.click(screen.getByText("select-1"));
    fireEvent.click(screen.getByText("select-2"));
    fireEvent.click(screen.getByText("Delete selected"));
    const dialog = screen.getByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    await vi.waitFor(() => expect(deleteTask).toHaveBeenCalledTimes(2));
    expect(deleteTask).toHaveBeenCalledWith(1);
    expect(deleteTask).toHaveBeenCalledWith(2);
    await vi.waitFor(() =>
      expect(screen.queryByText("Set status")).not.toBeInTheDocument(),
    );
  });

  it("'Select all' checkbox selects/deselects every displayed task", () => {
    useTaskDragReorderMock.mockReturnValue(
      dragState({
        displayTasks: [
          makeTask({ id: 1, title: "A" }),
          makeTask({ id: 2, title: "B" }),
        ],
      }),
    );
    renderList();

    const checkbox = screen.getByLabelText("Select all");
    expect(checkbox).toHaveAttribute("data-state", "unchecked");

    fireEvent.click(checkbox);
    expect(checkbox).toHaveAttribute("data-state", "checked");
    expect(screen.getByText("2 selected")).toBeInTheDocument();

    fireEvent.click(checkbox);
    expect(checkbox).toHaveAttribute("data-state", "unchecked");
    expect(screen.queryByText("Set status")).not.toBeInTheDocument();
  });

  it("wires SortableRow onOpenModal and onDelete to the prop callback and deleteTask", () => {
    const deleteTask = vi.fn();
    const onOpenModal = vi.fn();
    useProjectTaskListMock.mockReturnValue(hookState({ deleteTask }));
    useTaskDragReorderMock.mockReturnValue(
      dragState({ displayTasks: [makeTask({ id: 5 })] }),
    );
    renderList(onOpenModal);

    expect(sortableRowProps[0].onOpenModal).toBe(onOpenModal);

    (sortableRowProps[0].onDelete as (id: number) => void)(5);
    expect(deleteTask).toHaveBeenCalledWith(5);
  });

  it("shows 'Load more' only when hasMore is true, and calls loadMore on click", () => {
    const loadMore = vi.fn();
    useProjectTaskListMock.mockReturnValue(
      hookState({ hasMore: true, loadMore }),
    );
    useTaskDragReorderMock.mockReturnValue(
      dragState({ displayTasks: [makeTask()] }),
    );
    renderList();

    fireEvent.click(screen.getByText("Load more"));
    expect(loadMore).toHaveBeenCalled();
  });

  it("loads the tasks of the given project", () => {
    renderList();

    expect(useProjectTaskListMock).toHaveBeenCalledWith({ projectId: 1 });
  });

  it("persists a drag reorder through updateTask with the new sortOrder", () => {
    const updateTask = vi.fn();
    useProjectTaskListMock.mockReturnValue(hookState({ updateTask }));
    renderList();

    const persist = useTaskDragReorderMock.mock.calls[0][1] as (
      id: number,
      sortOrder: number,
    ) => void;
    persist(4, 2);

    expect(updateTask).toHaveBeenCalledWith({ id: 4, sortOrder: 2 });
  });

  it("hands drag end events the ids of the visible, sorted tasks", () => {
    const handleDragEnd = vi.fn();
    useTaskDragReorderMock.mockReturnValue(
      dragState({
        handleDragEnd,
        displayTasks: [
          makeTask({ id: 1, dueDate: "2026-01-01T00:00:00.000Z" }),
          makeTask({ id: 2, dueDate: "2026-05-01T00:00:00.000Z" }),
        ],
      }),
    );
    renderList();

    const event = { active: { id: 1 }, over: { id: 2 } };
    dndOnDragEnd!(event);

    expect(handleDragEnd).toHaveBeenCalledWith(event, [2, 1]);
  });

  it("does not reorder the task list it receives when sorting", () => {
    const displayTasks = [
      makeTask({ id: 1, dueDate: "2026-01-01T00:00:00.000Z" }),
      makeTask({ id: 2, dueDate: "2026-05-01T00:00:00.000Z" }),
    ];
    useTaskDragReorderMock.mockReturnValue(dragState({ displayTasks }));
    renderList();

    expect(displayTasks.map((t) => t.id)).toEqual([1, 2]);
  });

  it("hides tasks due after the 'Due to' date when only that bound is set", () => {
    useTaskDragReorderMock.mockReturnValue(
      dragState({
        displayTasks: [
          makeTask({
            id: 1,
            title: "Early",
            dueDate: "2026-01-05T00:00:00.000Z",
          }),
          makeTask({
            id: 2,
            title: "Late",
            dueDate: "2026-03-05T00:00:00.000Z",
          }),
        ],
      }),
    );
    renderList();

    fireEvent.change(screen.getByLabelText("Due to"), {
      target: { value: "2026-02-01" },
    });

    expect(screen.getByText("Early")).toBeInTheDocument();
    expect(screen.queryByText("Late")).not.toBeInTheDocument();
  });

  it("keeps tasks due on the from/to dates themselves, whatever the time of day", () => {
    useTaskDragReorderMock.mockReturnValue(
      dragState({
        displayTasks: [
          makeTask({
            id: 1,
            title: "On from",
            dueDate: "2026-02-01T00:00:00.000Z",
          }),
          makeTask({
            id: 2,
            title: "On to",
            dueDate: "2026-02-10T15:30:00.000Z",
          }),
        ],
      }),
    );
    renderList();

    fireEvent.change(screen.getByLabelText("Due from"), {
      target: { value: "2026-02-01" },
    });
    fireEvent.change(screen.getByLabelText("Due to"), {
      target: { value: "2026-02-10" },
    });

    expect(screen.getByText("On from")).toBeInTheDocument();
    expect(screen.getByText("On to")).toBeInTheDocument();
  });

  it("choosing a status filter forwards it to the hook", () => {
    const setStatusFilter = vi.fn();
    useProjectTaskListMock.mockReturnValue(hookState({ setStatusFilter }));
    renderList();

    fireEvent.click(screen.getByLabelText("Status"));
    fireEvent.click(screen.getByRole("option", { name: "Done" }));

    expect(setStatusFilter).toHaveBeenCalledWith("DONE");
  });

  it("create form: trims the title before creating, then closes and resets", async () => {
    const createTask = vi.fn().mockResolvedValue(undefined);
    useProjectTaskListMock.mockReturnValue(hookState({ createTask }));
    renderList();

    fireEvent.click(screen.getByText("+ New task"));
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "  New task  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    expect(createTask).toHaveBeenCalledWith({
      projectId: 1,
      title: "New task",
    });
    await vi.waitFor(() =>
      expect(screen.queryByLabelText("Title")).not.toBeInTheDocument(),
    );
    fireEvent.click(screen.getByText("+ New task"));
    expect(screen.getByLabelText("Title")).toHaveValue("");
  });

  it("create form: a whitespace-only title cannot be submitted", () => {
    const createTask = vi.fn().mockResolvedValue(undefined);
    useProjectTaskListMock.mockReturnValue(hookState({ createTask }));
    renderList();

    fireEvent.click(screen.getByText("+ New task"));
    const input = screen.getByLabelText("Title");
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(screen.getByRole("button", { name: "Create" })).toBeDisabled();
    expect(createTask).not.toHaveBeenCalled();
  });

  it("create form: keys other than Enter/Escape neither submit nor close", () => {
    const createTask = vi.fn().mockResolvedValue(undefined);
    useProjectTaskListMock.mockReturnValue(hookState({ createTask }));
    renderList();

    fireEvent.click(screen.getByText("+ New task"));
    const input = screen.getByLabelText("Title");
    fireEvent.change(input, { target: { value: "Draft" } });
    fireEvent.keyDown(input, { key: "a" });

    expect(createTask).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Title")).toHaveValue("Draft");
  });

  it.each(["Escape", "Cancel"])(
    "create form: reopening after %s starts with an empty title",
    (how) => {
      renderList();

      fireEvent.click(screen.getByText("+ New task"));
      const input = screen.getByLabelText("Title");
      fireEvent.change(input, { target: { value: "Draft" } });
      if (how === "Escape") fireEvent.keyDown(input, { key: "Escape" });
      else fireEvent.click(screen.getByText("Cancel"));
      fireEvent.click(screen.getByText("+ New task"));

      expect(screen.getByLabelText("Title")).toHaveValue("");
    },
  );

  it("'Set status' applies the status picked in the bulk bar", async () => {
    const updateTask = vi.fn().mockResolvedValue(undefined);
    useProjectTaskListMock.mockReturnValue(hookState({ updateTask }));
    useTaskDragReorderMock.mockReturnValue(
      dragState({ displayTasks: [makeTask({ id: 1, title: "A" })] }),
    );
    renderList();

    fireEvent.click(screen.getByText("select-1"));
    fireEvent.click(screen.getByLabelText("Bulk status"));
    fireEvent.click(screen.getByRole("option", { name: "Done" }));
    fireEvent.click(screen.getByText("Set status"));

    await vi.waitFor(() =>
      expect(updateTask).toHaveBeenCalledWith({ id: 1, status: "DONE" }),
    );
  });

  it.each([
    [["select-1"], "Delete 1 task?"],
    [["select-1", "select-2"], "Delete 2 tasks?"],
  ])("bulk delete confirmation pluralizes: %j → %s", (clicks, title) => {
    useTaskDragReorderMock.mockReturnValue(
      dragState({
        displayTasks: [
          makeTask({ id: 1, title: "A" }),
          makeTask({ id: 2, title: "B" }),
        ],
      }),
    );
    renderList();

    for (const c of clicks) fireEvent.click(screen.getByText(c));
    fireEvent.click(screen.getByText("Delete selected"));

    expect(
      within(screen.getByRole("alertdialog")).getByRole("heading"),
    ).toHaveTextContent(title);
  });

  it("hides 'Load more' when hasMore is false", () => {
    useTaskDragReorderMock.mockReturnValue(
      dragState({ displayTasks: [makeTask()] }),
    );
    renderList();

    expect(screen.queryByText("Load more")).not.toBeInTheDocument();
  });
});
