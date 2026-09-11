import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { createQueryClient } from "@/test/queryClientWrapper";
import { messages } from "@/i18n/messages";
import type { Task } from "@/types/tasks.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

const { dndHandlers } = vi.hoisted(() => ({
  dndHandlers: {} as {
    onDragStart?: (e: DragStartEvent) => void;
    onDragEnd?: (e: DragEndEvent) => void;
  },
}));

vi.mock("@dnd-kit/core", async () => {
  const actual =
    await vi.importActual<typeof import("@dnd-kit/core")>("@dnd-kit/core");
  return {
    ...actual,
    DndContext: (props: React.ComponentProps<typeof actual.DndContext>) => {
      dndHandlers.onDragStart = props.onDragStart;
      dndHandlers.onDragEnd = props.onDragEnd;
      return <actual.DndContext {...props} />;
    },
  };
});

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

function renderTab(
  props: Partial<Parameters<typeof TasksTab>[0]> = {},
  client: QueryClient = createQueryClient(),
) {
  return render(
    <QueryClientProvider client={client}>
      <IntlProvider locale="en" messages={messages.en}>
        <TasksTab
          projectId={1}
          tasks={[]}
          tasksLoading={false}
          taskHasMore={false}
          taskLoadMore={vi.fn()}
          memberMap={{}}
          onOpenModal={vi.fn()}
          {...props}
        />
      </IntlProvider>
    </QueryClientProvider>,
  );
}

describe("TasksTab", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
    gqlMutate.mockResolvedValue({ updateTask: {} });
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

  it("orders tasks within a column by due date, latest first and undated last, by default", () => {
    renderTab({
      tasks: [
        makeTask({
          id: 1,
          title: "No due date",
          status: "TODO",
          dueDate: null,
        }),
        makeTask({
          id: 2,
          title: "Due later",
          status: "TODO",
          dueDate: "2026-05-01T00:00:00.000Z",
        }),
        makeTask({
          id: 3,
          title: "Due soonest",
          status: "TODO",
          dueDate: "2026-01-01T00:00:00.000Z",
        }),
      ],
    });

    const titles = screen
      .getAllByText(/^(No due date|Due later|Due soonest)$/)
      .map((el) => el.textContent);
    expect(titles).toEqual(["Due later", "Due soonest", "No due date"]);
  });

  it("orders tasks within a column newest-created first when Created + Descending is chosen", () => {
    renderTab({
      tasks: [
        makeTask({
          id: 1,
          title: "Oldest",
          status: "TODO",
          createdAt: "2026-01-01T00:00:00.000Z",
        }),
        makeTask({
          id: 2,
          title: "Newest",
          status: "TODO",
          createdAt: "2026-03-01T00:00:00.000Z",
        }),
        makeTask({
          id: 3,
          title: "Middle",
          status: "TODO",
          createdAt: "2026-02-01T00:00:00.000Z",
        }),
      ],
    });

    fireEvent.click(screen.getByLabelText("Sort"));
    fireEvent.click(screen.getByRole("option", { name: "Created" }));

    const titles = screen
      .getAllByText(/^(Oldest|Newest|Middle)$/)
      .map((el) => el.textContent);
    expect(titles).toEqual(["Newest", "Middle", "Oldest"]);
  });

  it("sorts tasks alphabetically within a column when Task name + Ascending is chosen", () => {
    renderTab({
      tasks: [
        makeTask({ id: 1, title: "Zebra task", status: "TODO" }),
        makeTask({ id: 2, title: "apple task", status: "TODO" }),
        makeTask({ id: 3, title: "Mango task", status: "TODO" }),
      ],
    });

    fireEvent.click(screen.getByLabelText("Sort"));
    fireEvent.click(screen.getByRole("option", { name: "Task name" }));
    fireEvent.click(screen.getByLabelText("Order"));
    fireEvent.click(screen.getByRole("option", { name: "Ascending" }));

    const titles = screen
      .getAllByText(/^(apple|Mango|Zebra) task$/)
      .map((el) => el.textContent);
    expect(titles).toEqual(["apple task", "Mango task", "Zebra task"]);
  });

  it("sorts tasks in reverse alphabetical order when Task name + Descending is chosen", () => {
    renderTab({
      tasks: [
        makeTask({ id: 1, title: "Zebra task", status: "TODO" }),
        makeTask({ id: 2, title: "apple task", status: "TODO" }),
        makeTask({ id: 3, title: "Mango task", status: "TODO" }),
      ],
    });

    fireEvent.click(screen.getByLabelText("Sort"));
    fireEvent.click(screen.getByRole("option", { name: "Task name" }));

    const titles = screen
      .getAllByText(/^(apple|Mango|Zebra) task$/)
      .map((el) => el.textContent);
    expect(titles).toEqual(["Zebra task", "Mango task", "apple task"]);
  });

  it("sorts tasks by due date (latest first, undated last) when Due date sort is chosen explicitly", () => {
    renderTab({
      tasks: [
        makeTask({
          id: 1,
          title: "No due date",
          status: "TODO",
          dueDate: null,
        }),
        makeTask({
          id: 2,
          title: "Due later",
          status: "TODO",
          dueDate: "2026-05-01T00:00:00.000Z",
        }),
        makeTask({
          id: 3,
          title: "Due soonest",
          status: "TODO",
          dueDate: "2026-01-01T00:00:00.000Z",
        }),
      ],
    });

    fireEvent.click(screen.getByRole("combobox", { name: "Sort" }));
    fireEvent.click(screen.getByRole("option", { name: "Due date" }));

    const titles = screen
      .getAllByText(/^(No due date|Due later|Due soonest)$/)
      .map((el) => el.textContent);
    expect(titles).toEqual(["Due later", "Due soonest", "No due date"]);
  });

  it("shows 'Empty' for columns with no tasks", () => {
    renderTab({ tasks: [] });
    const emptyLabels = screen.getAllByText("Empty");
    expect(emptyLabels).toHaveLength(4);
  });

  it("renders a Paid column alongside Todo/In Progress/Done", () => {
    renderTab({
      tasks: [makeTask({ id: 1, title: "Settled", status: "PAID" })],
    });
    expect(screen.getByText("Paid")).toBeInTheDocument();
    expect(screen.getByText("Settled")).toBeInTheDocument();
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

  it("tracks the dragged task as active without throwing when a drag starts", () => {
    renderTab({
      tasks: [makeTask({ id: 4, title: "Being dragged" })],
    });

    expect(() => {
      act(() => {
        dndHandlers.onDragStart?.({ active: { id: 4 } } as DragStartEvent);
      });
    }).not.toThrow();

    expect(screen.getByText("Being dragged")).toBeInTheDocument();
  });

  it("does nothing when a drag ends outside any droppable target", () => {
    renderTab({
      tasks: [makeTask({ id: 4, title: "Task A", status: "TODO" })],
    });

    act(() => {
      dndHandlers.onDragEnd?.({
        active: { id: 4 },
        over: null,
      } as unknown as DragEndEvent);
    });

    expect(gqlMutate).not.toHaveBeenCalled();
  });

  it("does nothing when a drag ends on its own position", () => {
    renderTab({
      tasks: [makeTask({ id: 4, title: "Task A", status: "TODO" })],
    });

    act(() => {
      dndHandlers.onDragEnd?.({
        active: { id: 4 },
        over: { id: 4 },
      } as unknown as DragEndEvent);
    });

    expect(gqlMutate).not.toHaveBeenCalled();
  });

  it("updates the task status when dropped on a different status column", async () => {
    renderTab({
      tasks: [makeTask({ id: 4, title: "Task A", status: "TODO" })],
    });

    act(() => {
      dndHandlers.onDragEnd?.({
        active: { id: 4 },
        over: { id: "DONE" },
      } as unknown as DragEndEvent);
    });

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), {
        input: expect.objectContaining({ id: 4, status: "DONE" }),
      }),
    );
  });

  it("updates the task status when dropped onto a task in a different column", async () => {
    renderTab({
      tasks: [
        makeTask({ id: 4, title: "Task A", status: "TODO" }),
        makeTask({ id: 5, title: "Task B", status: "DONE" }),
      ],
    });

    act(() => {
      dndHandlers.onDragEnd?.({
        active: { id: 4 },
        over: { id: 5 },
      } as unknown as DragEndEvent);
    });

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), {
        input: expect.objectContaining({ id: 4, status: "DONE" }),
      }),
    );
  });

  it("calls updateTask with the new sortOrder when reordering within the same status column", async () => {
    renderTab({
      tasks: [
        makeTask({ id: 4, title: "Task A", status: "TODO" }),
        makeTask({ id: 5, title: "Task B", status: "TODO" }),
      ],
    });

    act(() => {
      dndHandlers.onDragEnd?.({
        active: { id: 4 },
        over: { id: 5 },
      } as unknown as DragEndEvent);
    });

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), {
        input: expect.objectContaining({ id: 4, sortOrder: 1 }),
      }),
    );
  });

  it("optimistically reorders the on-screen task list within the same status column", () => {
    renderTab({
      tasks: [
        makeTask({ id: 4, title: "Task A", status: "TODO" }),
        makeTask({ id: 5, title: "Task B", status: "TODO" }),
        makeTask({ id: 6, title: "Task C", status: "TODO" }),
      ],
    });

    act(() => {
      dndHandlers.onDragEnd?.({
        active: { id: 4 },
        over: { id: 6 },
      } as unknown as DragEndEvent);
    });

    const titles = screen
      .getAllByText(/Task [ABC]/)
      .map((el) => el.textContent);
    expect(titles).toEqual(["Task B", "Task C", "Task A"]);
  });

  it("optimistically updates the cached task list on a status-changing drop", async () => {
    const client = createQueryClient();
    const task = makeTask({ id: 4, title: "Task A", status: "TODO" });
    client.setQueryData(["tasks", 1], {
      pages: [{ items: [task], nextCursor: null, total: 1 }],
      pageParams: [undefined],
    });
    renderTab({ tasks: [task] }, client);

    act(() => {
      dndHandlers.onDragEnd?.({
        active: { id: 4 },
        over: { id: "DONE" },
      } as unknown as DragEndEvent);
    });

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), {
        input: expect.objectContaining({ id: 4, status: "DONE" }),
      }),
    );

    const cached = client.getQueryData<{
      pages: { items: Task[] }[];
    }>(["tasks", 1]);
    expect(cached?.pages[0].items[0].status).toBe("DONE");
  });

  it("does nothing when the dragged task can no longer be found", () => {
    renderTab({
      tasks: [makeTask({ id: 4, title: "Task A", status: "TODO" })],
    });

    act(() => {
      dndHandlers.onDragEnd?.({
        active: { id: 999 },
        over: { id: "DONE" },
      } as unknown as DragEndEvent);
    });

    expect(gqlMutate).not.toHaveBeenCalled();
  });

  it("shows the due date filter inputs", () => {
    renderTab();
    expect(screen.getByLabelText("Due from")).toBeInTheDocument();
    expect(screen.getByLabelText("Due to")).toBeInTheDocument();
  });

  it("hides tasks whose due date falls before the from filter", () => {
    renderTab({
      tasks: [
        makeTask({
          id: 1,
          title: "Early",
          dueDate: "2026-01-05T00:00:00.000Z",
        }),
        makeTask({ id: 2, title: "Late", dueDate: "2026-03-05T00:00:00.000Z" }),
      ],
    });

    fireEvent.change(screen.getByLabelText("Due from"), {
      target: { value: "2026-02-01" },
    });

    expect(screen.queryByText("Early")).not.toBeInTheDocument();
    expect(screen.getByText("Late")).toBeInTheDocument();
  });

  it("hides tasks whose due date falls after the to filter", () => {
    renderTab({
      tasks: [
        makeTask({
          id: 1,
          title: "Early",
          dueDate: "2026-01-05T00:00:00.000Z",
        }),
        makeTask({ id: 2, title: "Late", dueDate: "2026-03-05T00:00:00.000Z" }),
      ],
    });

    fireEvent.change(screen.getByLabelText("Due to"), {
      target: { value: "2026-02-01" },
    });

    expect(screen.getByText("Early")).toBeInTheDocument();
    expect(screen.queryByText("Late")).not.toBeInTheDocument();
  });

  it("hides tasks with no due date once a due date filter is active", () => {
    renderTab({
      tasks: [
        makeTask({ id: 1, title: "No due date", dueDate: null }),
        makeTask({
          id: 2,
          title: "Has due date",
          dueDate: "2026-01-05T00:00:00.000Z",
        }),
      ],
    });

    fireEvent.change(screen.getByLabelText("Due from"), {
      target: { value: "2026-01-01" },
    });

    expect(screen.queryByText("No due date")).not.toBeInTheDocument();
    expect(screen.getByText("Has due date")).toBeInTheDocument();
  });

  it("clears the due date filter when Clear filter is clicked", () => {
    renderTab({
      tasks: [
        makeTask({
          id: 1,
          title: "Early",
          dueDate: "2026-01-05T00:00:00.000Z",
        }),
        makeTask({ id: 2, title: "Late", dueDate: "2026-03-05T00:00:00.000Z" }),
      ],
    });

    fireEvent.change(screen.getByLabelText("Due from"), {
      target: { value: "2026-02-01" },
    });
    expect(screen.queryByText("Early")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Clear filter"));

    expect(screen.getByText("Early")).toBeInTheDocument();
    expect(screen.getByText("Late")).toBeInTheDocument();
  });
});
