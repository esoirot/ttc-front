import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useProjectTaskListMock = vi.fn();
vi.mock("@/hooks/projects/useProjectTaskList", () => ({
  useProjectTaskList: (...args: unknown[]) => useProjectTaskListMock(...args),
}));

const useTaskDragReorderMock = vi.fn();
vi.mock("@/hooks/projects/useTaskDragReorder", () => ({
  useTaskDragReorder: (...args: unknown[]) => useTaskDragReorderMock(...args),
}));

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

  it("hides 'Load more' when hasMore is false", () => {
    useTaskDragReorderMock.mockReturnValue(
      dragState({ displayTasks: [makeTask()] }),
    );
    renderList();

    expect(screen.queryByText("Load more")).not.toBeInTheDocument();
  });
});
