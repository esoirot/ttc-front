import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BillableToggle } from "./BillableToggle";

describe("BillableToggle", () => {
  it("toggles billable to non-billable on click", () => {
    const onChange = vi.fn();
    render(<BillableToggle billable={true} onChange={onChange} />);

    fireEvent.click(screen.getByText("$"));

    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("toggles non-billable to billable on click", () => {
    const onChange = vi.fn();
    render(<BillableToggle billable={false} onChange={onChange} />);

    fireEvent.click(screen.getByText("$"));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("is disabled and does not call onChange when disabled", () => {
    const onChange = vi.fn();
    render(<BillableToggle billable={true} disabled onChange={onChange} />);

    const button = screen.getByText("$");
    expect(button).toBeDisabled();
    fireEvent.click(button);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("shows the disabled-plan tooltip title when disabled", () => {
    render(<BillableToggle billable={true} disabled onChange={vi.fn()} />);
    expect(screen.getByText("$")).toHaveAttribute(
      "title",
      "Billability editing not available on your Clockify plan",
    );
  });
});
