import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DateRangeFilter } from "./DateRangeFilter";

describe("DateRangeFilter", () => {
  it("renders the start/end date values and the count/total/duration summary", () => {
    render(
      <DateRangeFilter
        startDate="2026-06-01"
        setStartDate={vi.fn()}
        endDate="2026-06-30"
        setEndDate={vi.fn()}
        count={5}
        total={12}
        totalSeconds={3661}
      />,
    );

    expect(screen.getByLabelText("From")).toHaveValue("2026-06-01");
    expect(screen.getByLabelText("To")).toHaveValue("2026-06-30");
    expect(screen.getByText("5 of 12 · 1:01:01")).toBeInTheDocument();
  });

  it("calls setStartDate/setEndDate on change", () => {
    const setStartDate = vi.fn();
    const setEndDate = vi.fn();
    render(
      <DateRangeFilter
        startDate="2026-06-01"
        setStartDate={setStartDate}
        endDate="2026-06-30"
        setEndDate={setEndDate}
        count={0}
        total={0}
        totalSeconds={0}
      />,
    );

    fireEvent.change(screen.getByLabelText("From"), {
      target: { value: "2026-06-05" },
    });
    fireEvent.change(screen.getByLabelText("To"), {
      target: { value: "2026-06-20" },
    });

    expect(setStartDate).toHaveBeenCalledWith("2026-06-05");
    expect(setEndDate).toHaveBeenCalledWith("2026-06-20");
  });

  it("constrains start date's max and end date's min to the other field", () => {
    render(
      <DateRangeFilter
        startDate="2026-06-01"
        setStartDate={vi.fn()}
        endDate="2026-06-30"
        setEndDate={vi.fn()}
        count={0}
        total={0}
        totalSeconds={0}
      />,
    );

    expect(screen.getByLabelText("From")).toHaveAttribute("max", "2026-06-30");
    expect(screen.getByLabelText("To")).toHaveAttribute("min", "2026-06-01");
  });
});
