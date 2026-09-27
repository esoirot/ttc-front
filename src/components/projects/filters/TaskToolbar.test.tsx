import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createIntlWrapper } from "@/test/intlWrapper";
import type { TaskToolbarProps } from "@/types/projects.types";
import { TaskToolbar } from "./TaskToolbar";

const wrapper = createIntlWrapper();

function renderToolbar(overrides: Partial<TaskToolbarProps> = {}) {
  const props: TaskToolbarProps = {
    idPrefix: "test",
    dueFrom: "",
    dueTo: "",
    onDueFromChange: vi.fn(),
    onDueToChange: vi.fn(),
    sortField: "dueDate",
    sortDirection: "desc",
    onSortFieldChange: vi.fn(),
    onSortDirectionChange: vi.fn(),
    onNewTask: vi.fn(),
    ...overrides,
  };
  render(<TaskToolbar {...props} />, { wrapper });
  return props;
}

describe("TaskToolbar", () => {
  it("shows the due date range, sort controls and New task button", () => {
    renderToolbar();

    expect(screen.getByLabelText("Due from")).toBeInTheDocument();
    expect(screen.getByLabelText("Due to")).toBeInTheDocument();
    expect(screen.getByLabelText("Sort")).toBeInTheDocument();
    expect(screen.getByLabelText("Order")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "+ New task" }),
    ).toBeInTheDocument();
  });

  it("renders extra leading filters passed as children", () => {
    render(
      <TaskToolbar
        idPrefix="test"
        dueFrom=""
        dueTo=""
        onDueFromChange={vi.fn()}
        onDueToChange={vi.fn()}
        sortField="dueDate"
        sortDirection="desc"
        onSortFieldChange={vi.fn()}
        onSortDirectionChange={vi.fn()}
        onNewTask={vi.fn()}
      >
        <p>Status filter slot</p>
      </TaskToolbar>,
      { wrapper },
    );

    expect(screen.getByText("Status filter slot")).toBeInTheDocument();
  });

  it("reports due date changes", () => {
    const props = renderToolbar();

    fireEvent.change(screen.getByLabelText("Due from"), {
      target: { value: "2026-01-01" },
    });
    fireEvent.change(screen.getByLabelText("Due to"), {
      target: { value: "2026-02-01" },
    });

    expect(props.onDueFromChange).toHaveBeenCalledWith("2026-01-01");
    expect(props.onDueToChange).toHaveBeenCalledWith("2026-02-01");
  });

  it("keeps the range valid by bounding each date with the other", () => {
    renderToolbar({ dueFrom: "2026-01-01", dueTo: "2026-02-01" });

    expect(screen.getByLabelText("Due from")).toHaveAttribute(
      "max",
      "2026-02-01",
    );
    expect(screen.getByLabelText("Due to")).toHaveAttribute(
      "min",
      "2026-01-01",
    );
  });

  it("hides Clear filter while no due date is set", () => {
    renderToolbar();

    expect(
      screen.queryByRole("button", { name: "Clear filter" }),
    ).not.toBeInTheDocument();
  });

  it("offers Clear filter when only the end date is set", () => {
    renderToolbar({ dueTo: "2026-02-01" });

    expect(
      screen.getByRole("button", { name: "Clear filter" }),
    ).toBeInTheDocument();
  });

  it("clears both dates when Clear filter is clicked", () => {
    const props = renderToolbar({ dueFrom: "2026-01-01" });

    fireEvent.click(screen.getByRole("button", { name: "Clear filter" }));

    expect(props.onDueFromChange).toHaveBeenCalledWith("");
    expect(props.onDueToChange).toHaveBeenCalledWith("");
  });

  it("omits the New task button when no onNewTask handler is given", () => {
    // given a toolbar without a New task handler
    renderToolbar({ onNewTask: undefined });

    // then no New task button is rendered
    expect(
      screen.queryByRole("button", { name: "+ New task" }),
    ).not.toBeInTheDocument();
  });

  it("calls onNewTask when New task is clicked", () => {
    const props = renderToolbar();

    fireEvent.click(screen.getByRole("button", { name: "+ New task" }));

    expect(props.onNewTask).toHaveBeenCalledOnce();
  });
});
