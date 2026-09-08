import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TaskSortControls } from "./TaskSortControls";

function renderControls(
  overrides: Partial<Parameters<typeof TaskSortControls>[0]> = {},
) {
  return render(
    <TaskSortControls
      field="dueDate"
      direction="desc"
      onFieldChange={vi.fn()}
      onDirectionChange={vi.fn()}
      idPrefix="test"
      {...overrides}
    />,
  );
}

describe("TaskSortControls", () => {
  it("shows Sort and Order selects with the current field and direction", () => {
    renderControls();
    expect(screen.getByLabelText("Sort")).toBeInTheDocument();
    expect(screen.getByLabelText("Order")).toBeInTheDocument();
    expect(screen.getByText("Due date")).toBeInTheDocument();
    expect(screen.getByText("Descending")).toBeInTheDocument();
  });

  it("lists all three sort fields in the Sort select", () => {
    renderControls();
    fireEvent.click(screen.getByLabelText("Sort"));
    expect(
      screen.getByRole("option", { name: "Due date" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Task name" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Created" })).toBeInTheDocument();
  });

  it("calls onFieldChange with the picked field", () => {
    const onFieldChange = vi.fn();
    renderControls({ onFieldChange });
    fireEvent.click(screen.getByLabelText("Sort"));
    fireEvent.click(screen.getByRole("option", { name: "Task name" }));
    expect(onFieldChange).toHaveBeenCalledWith("title");
  });

  it("calls onDirectionChange with the picked direction", () => {
    const onDirectionChange = vi.fn();
    renderControls({ onDirectionChange });
    fireEvent.click(screen.getByLabelText("Order"));
    fireEvent.click(screen.getByRole("option", { name: "Ascending" }));
    expect(onDirectionChange).toHaveBeenCalledWith("asc");
  });

  it("uses idPrefix to give each select a unique id", () => {
    renderControls({ idPrefix: "kanban" });
    expect(screen.getByLabelText("Sort")).toHaveAttribute(
      "id",
      "kanban-sort-field",
    );
    expect(screen.getByLabelText("Order")).toHaveAttribute(
      "id",
      "kanban-sort-direction",
    );
  });
});
