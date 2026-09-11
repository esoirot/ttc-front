import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BillableToggle } from "./BillableToggle";
import { createIntlWrapper } from "@/test/intlWrapper";

const wrapper = createIntlWrapper();

describe("BillableToggle", () => {
  it("toggles billable to non-billable on click", () => {
    const onChange = vi.fn();
    render(<BillableToggle billable={true} onChange={onChange} />, { wrapper });

    fireEvent.click(screen.getByText("$"));

    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("toggles non-billable to billable on click", () => {
    const onChange = vi.fn();
    render(<BillableToggle billable={false} onChange={onChange} />, {
      wrapper,
    });

    fireEvent.click(screen.getByText("$"));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("is disabled and does not call onChange when disabled", () => {
    const onChange = vi.fn();
    render(<BillableToggle billable={true} disabled onChange={onChange} />, {
      wrapper,
    });

    const button = screen.getByText("$");
    expect(button).toBeDisabled();
    fireEvent.click(button);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("shows the disabled-plan tooltip title when disabled", () => {
    render(<BillableToggle billable={true} disabled onChange={vi.fn()} />, {
      wrapper,
    });
    expect(screen.getByText("$")).toHaveAttribute(
      "title",
      "Billability editing not available on your Clockify plan",
    );
  });

  it("renders French copy when locale is fr", () => {
    render(<BillableToggle billable={true} onChange={vi.fn()} />, {
      wrapper: createIntlWrapper("fr"),
    });
    expect(screen.getByText("$")).toHaveAttribute("title", "Facturable");
  });
});
