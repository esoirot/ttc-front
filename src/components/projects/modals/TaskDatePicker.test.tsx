import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TaskDatePicker } from "./TaskDatePicker";

function renderPicker(
  props: Partial<Parameters<typeof TaskDatePicker>[0]> = {},
) {
  return render(
    <TaskDatePicker
      startDate={null}
      dueDate={null}
      recurring={null}
      reminderOffset={null}
      onUpdate={vi.fn()}
      {...props}
    />,
  );
}

describe("TaskDatePicker", () => {
  it("shows 'No date' on the trigger when neither date is set", () => {
    renderPicker();
    expect(screen.getByText(/No date/)).toBeInTheDocument();
  });

  it("shows the due date on the trigger when set, preferring it over start date", () => {
    renderPicker({
      startDate: "2026-06-01T00:00:00.000Z",
      dueDate: "2026-07-01T00:00:00.000Z",
    });
    expect(screen.getByText(/Jul 1, 2026/)).toBeInTheDocument();
  });

  it("opens the popover and saves an enabled due date", () => {
    const onUpdate = vi.fn();
    renderPicker({ onUpdate });

    fireEvent.click(screen.getByText(/No date/));
    fireEvent.click(screen.getByLabelText("Due Date"));

    const dateInputs = screen.getAllByDisplayValue("");
    const dueDateInput = dateInputs.find(
      (el) => (el as HTMLInputElement).type === "date",
    )!;
    fireEvent.change(dueDateInput, { target: { value: "2026-08-15" } });

    fireEvent.click(screen.getByText("Save"));

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ dueDate: "2026-08-15T09:00:00" }),
    );
  });

  it("removes all dates when Remove is clicked", () => {
    const onUpdate = vi.fn();
    renderPicker({ dueDate: "2026-07-01T00:00:00.000Z", onUpdate });

    fireEvent.click(screen.getByText(/Jul 1, 2026/));
    fireEvent.click(screen.getByText("Remove"));

    expect(onUpdate).toHaveBeenCalledWith({
      startDate: null,
      dueDate: null,
      recurring: null,
      reminderOffset: null,
    });
  });

  it("does not show a Remove button when there is no date yet", () => {
    renderPicker();
    fireEvent.click(screen.getByText(/No date/));
    expect(screen.queryByText("Remove")).not.toBeInTheDocument();
  });

  it("renders open when the open prop is true, without needing a click", () => {
    renderPicker({ open: true, onOpenChange: vi.fn() });
    expect(screen.getByText("Recurring")).toBeInTheDocument();
  });

  it("calls onOpenChange instead of managing state internally when controlled", () => {
    const onOpenChange = vi.fn();
    renderPicker({ open: false, onOpenChange });
    fireEvent.click(screen.getByText(/No date/));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByText("Recurring")).not.toBeInTheDocument();
  });
});
