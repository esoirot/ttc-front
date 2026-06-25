import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useProjectTaskListMock = vi.fn();
vi.mock("@/hooks/projects/useProjectTaskList", () => ({
  useProjectTaskList: (...args: unknown[]) => useProjectTaskListMock(...args),
}));

let sortableRowProps: Record<string, unknown>[] = [];
vi.mock("../rows/SortableRow", () => ({
  SortableRow: (props: Record<string, unknown>) => {
    sortableRowProps.push(props);
    return (
      <div data-testid="sortable-row">
        {(props.task as { title: string }).title}
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
    deleteTask: vi.fn(),
    statusFilter: "ALL",
    setStatusFilter: vi.fn(),
    selected: new Set<number>(),
    bulkStatus: "TODO",
    setBulkStatus: vi.fn(),
    showCreate: false,
    setShowCreate: vi.fn(),
    newTitle: "",
    setNewTitle: vi.fn(),
    sensors: [],
    filtered: [],
    allSelected: false,
    members: [],
    handleCreate: vi.fn(),
    handleSelect: vi.fn(),
    handleSelectAll: vi.fn(),
    handleBulkDelete: vi.fn(),
    handleBulkStatus: vi.fn(),
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
    sortableRowProps = [];
  });

  it("shows skeletons while loading", () => {
    useProjectTaskListMock.mockReturnValue(hookState({ loading: true }));
    const { container } = renderList();

    expect(
      container.querySelectorAll('[class*="animate-pulse"]').length,
    ).toBeGreaterThan(0);
  });

  it("shows 'No tasks.' when filtered is empty and not loading", () => {
    useProjectTaskListMock.mockReturnValue(hookState());
    renderList();

    expect(screen.getByText("No tasks.")).toBeInTheDocument();
  });

  it("renders a SortableRow per filtered task", () => {
    useProjectTaskListMock.mockReturnValue(
      hookState({
        filtered: [
          makeTask({ id: 1, title: "A" }),
          makeTask({ id: 2, title: "B" }),
        ],
      }),
    );
    renderList();

    expect(screen.getAllByTestId("sortable-row")).toHaveLength(2);
  });

  it("toggles the create form via '+ New task'", () => {
    const setShowCreate = vi.fn();
    useProjectTaskListMock.mockReturnValue(hookState({ setShowCreate }));
    renderList();

    fireEvent.click(screen.getByText("+ New task"));
    expect(setShowCreate).toHaveBeenCalledWith(true);
  });

  it("create form: typing updates newTitle, Enter calls handleCreate", () => {
    const setNewTitle = vi.fn();
    const handleCreate = vi.fn();
    useProjectTaskListMock.mockReturnValue(
      hookState({ showCreate: true, setNewTitle, handleCreate }),
    );
    renderList();

    const input = screen.getByLabelText("Title");
    fireEvent.change(input, { target: { value: "New task" } });
    expect(setNewTitle).toHaveBeenCalledWith("New task");

    fireEvent.keyDown(input, { key: "Enter" });
    expect(handleCreate).toHaveBeenCalled();
  });

  it("create form: Escape clears title and hides the form", () => {
    const setNewTitle = vi.fn();
    const setShowCreate = vi.fn();
    useProjectTaskListMock.mockReturnValue(
      hookState({ showCreate: true, setNewTitle, setShowCreate }),
    );
    renderList();

    fireEvent.keyDown(screen.getByLabelText("Title"), { key: "Escape" });

    expect(setShowCreate).toHaveBeenCalledWith(false);
    expect(setNewTitle).toHaveBeenCalledWith("");
  });

  it("Create button disabled when title is blank or createLoading is true", () => {
    useProjectTaskListMock.mockReturnValue(
      hookState({ showCreate: true, newTitle: "" }),
    );
    const { rerender } = renderList();
    expect(screen.getByRole("button", { name: "Create" })).toBeDisabled();

    useProjectTaskListMock.mockReturnValue(
      hookState({ showCreate: true, newTitle: "X", createLoading: true }),
    );
    rerender(
      <ProjectTaskList projectId={1} members={[]} onOpenModal={vi.fn()} />,
    );
    expect(screen.getByRole("button", { name: "Creating…" })).toBeDisabled();
  });

  it("Cancel in the create form clears title and hides it", () => {
    const setNewTitle = vi.fn();
    const setShowCreate = vi.fn();
    useProjectTaskListMock.mockReturnValue(
      hookState({ showCreate: true, setNewTitle, setShowCreate }),
    );
    renderList();

    fireEvent.click(screen.getByText("Cancel"));

    expect(setShowCreate).toHaveBeenCalledWith(false);
    expect(setNewTitle).toHaveBeenCalledWith("");
  });

  it("shows the bulk action bar only when tasks are selected", () => {
    useProjectTaskListMock.mockReturnValue(
      hookState({ selected: new Set([1, 2]) }),
    );
    renderList();

    expect(screen.getByText("2 selected")).toBeInTheDocument();
    expect(screen.getByText("Set status")).toBeInTheDocument();
    expect(screen.getByText("Delete selected")).toBeInTheDocument();
  });

  it("hides the bulk action bar when nothing is selected", () => {
    useProjectTaskListMock.mockReturnValue(hookState());
    renderList();

    expect(screen.queryByText("Set status")).not.toBeInTheDocument();
  });

  it("'Set status' calls handleBulkStatus", () => {
    const handleBulkStatus = vi.fn();
    useProjectTaskListMock.mockReturnValue(
      hookState({ selected: new Set([1]), handleBulkStatus }),
    );
    renderList();

    fireEvent.click(screen.getByText("Set status"));
    expect(handleBulkStatus).toHaveBeenCalled();
  });

  it("confirming 'Delete selected' calls handleBulkDelete", () => {
    const handleBulkDelete = vi.fn();
    useProjectTaskListMock.mockReturnValue(
      hookState({ selected: new Set([1, 2]), handleBulkDelete }),
    );
    renderList();

    fireEvent.click(screen.getByText("Delete selected"));
    fireEvent.click(screen.getByText("Delete"));

    expect(handleBulkDelete).toHaveBeenCalled();
  });

  it("'Select all' checkbox reflects allSelected and calls handleSelectAll", () => {
    const handleSelectAll = vi.fn();
    useProjectTaskListMock.mockReturnValue(
      hookState({
        filtered: [makeTask()],
        allSelected: true,
        handleSelectAll,
      }),
    );
    renderList();

    const checkbox = screen.getByLabelText("Select all");
    expect(checkbox).toHaveAttribute("data-state", "checked");

    fireEvent.click(checkbox);
    expect(handleSelectAll).toHaveBeenCalledWith(false);
  });

  it("wires SortableRow onSelect/onOpenModal/onDelete to the hook and prop callbacks", () => {
    const handleSelect = vi.fn();
    const deleteTask = vi.fn();
    const onOpenModal = vi.fn();
    useProjectTaskListMock.mockReturnValue(
      hookState({
        filtered: [makeTask({ id: 5 })],
        handleSelect,
        deleteTask,
      }),
    );
    renderList(onOpenModal);

    expect(sortableRowProps[0].onSelect).toBe(handleSelect);
    expect(sortableRowProps[0].onOpenModal).toBe(onOpenModal);

    (sortableRowProps[0].onDelete as (id: number) => void)(5);
    expect(deleteTask).toHaveBeenCalledWith(5);
  });

  it("shows 'Load more' only when hasMore is true, and calls loadMore on click", () => {
    const loadMore = vi.fn();
    useProjectTaskListMock.mockReturnValue(
      hookState({ filtered: [makeTask()], hasMore: true, loadMore }),
    );
    renderList();

    fireEvent.click(screen.getByText("Load more"));
    expect(loadMore).toHaveBeenCalled();
  });

  it("hides 'Load more' when hasMore is false", () => {
    useProjectTaskListMock.mockReturnValue(
      hookState({ filtered: [makeTask()], hasMore: false }),
    );
    renderList();

    expect(screen.queryByText("Load more")).not.toBeInTheDocument();
  });
});
