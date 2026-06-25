import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";
import type { Task } from "@/types/tasks.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: () => navigateMock };
});

import { TasksTab } from "./TasksTab";

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

function renderTab(props: Partial<Parameters<typeof TasksTab>[0]> = {}) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <TasksTab
        projectId={1}
        tasks={[]}
        tasksLoading={false}
        taskHasMore={false}
        taskLoadMore={vi.fn()}
        members={[]}
        memberMap={{}}
        onOpenModal={vi.fn()}
        {...props}
      />
    </QueryClientProvider>,
  );
}

describe("TasksTab", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
    navigateMock.mockReset();
  });

  it("shows a loading skeleton while tasks load", () => {
    renderTab({ tasksLoading: true });
    expect(screen.queryByText("Todo")).not.toBeInTheDocument();
  });

  it("groups tasks into Todo/In Progress/Done columns", () => {
    renderTab({
      tasks: [
        makeTask({ id: 1, title: "A", status: "TODO" }),
        makeTask({ id: 2, title: "B", status: "IN_PROGRESS" }),
        makeTask({ id: 3, title: "C", status: "DONE" }),
      ],
    });

    expect(screen.getByText("Todo")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
  });

  it("shows 'Empty' for columns with no tasks", () => {
    renderTab({ tasks: [] });
    const emptyLabels = screen.getAllByText("Empty");
    expect(emptyLabels).toHaveLength(3);
  });

  it("shows a Load more tasks button when taskHasMore is true", () => {
    renderTab({ taskHasMore: true });
    expect(screen.getByText("Load more tasks")).toBeInTheDocument();
  });

  it("navigates to the new-task route when '+ New task' is clicked", () => {
    renderTab({ projectId: 7 });
    fireEvent.click(screen.getByText("+ New task"));
    expect(navigateMock).toHaveBeenCalledWith("/projects/7/tasks/new");
  });

  it("calls onOpenModal when a task card is clicked", () => {
    const onOpenModal = vi.fn();
    renderTab({
      tasks: [makeTask({ id: 4, title: "Click me" })],
      onOpenModal,
    });
    fireEvent.click(screen.getByText("Click me"));
    expect(onOpenModal).toHaveBeenCalledWith(4);
  });

  it("calls taskLoadMore when Load more tasks is clicked", () => {
    const taskLoadMore = vi.fn();
    renderTab({ taskHasMore: true, taskLoadMore });
    fireEvent.click(screen.getByText("Load more tasks"));
    expect(taskLoadMore).toHaveBeenCalled();
  });

  it("does not show Load more tasks when taskHasMore is false", () => {
    renderTab({ taskHasMore: false });
    expect(screen.queryByText("Load more tasks")).not.toBeInTheDocument();
  });

  it("renders column headers even when all columns are empty", () => {
    renderTab({ tasks: [] });
    expect(screen.getByText("Todo")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("shows task due date on the card", () => {
    renderTab({
      tasks: [
        makeTask({ id: 1, title: "Spec", dueDate: "2026-12-31T00:00:00.000Z" }),
      ],
    });
    expect(screen.getByText("2026-12-31")).toBeInTheDocument();
  });

  it("confirms and calls deleteTask when the delete button is clicked", async () => {
    gqlMutate.mockResolvedValueOnce({ deleteTask: { id: 1 } });
    renderTab({
      tasks: [makeTask({ id: 1, title: "Translate doc" })],
    });

    fireEvent.click(screen.getByRole("button", { name: "Delete task" }));
    const dialog = screen.getByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ id: 1 }),
      ),
    );
  });

  it("does not call deleteTask when Cancel is clicked in the confirm dialog", () => {
    renderTab({
      tasks: [makeTask({ id: 1, title: "Translate doc" })],
    });

    fireEvent.click(screen.getByRole("button", { name: "Delete task" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(gqlMutate).not.toHaveBeenCalled();
  });
});
