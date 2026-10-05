import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createIntlWrapper } from "@/test/intlWrapper";
import { MonthSelector } from "./MonthSelector";

const october = new Date(2026, 9, 1);
const march2024 = new Date(2024, 2, 1);

function renderSelector(
  month: Date,
  {
    onChange = vi.fn(),
    min = march2024,
    max = october,
    locale = "en" as "en" | "fr",
  } = {},
) {
  render(
    <MonthSelector month={month} onChange={onChange} min={min} max={max} />,
    { wrapper: createIntlWrapper(locale) },
  );
  return onChange;
}

function monthPicker() {
  return screen.getByRole("combobox", { name: "Month" });
}

function yearPicker() {
  return screen.getByRole("combobox", { name: "Year" });
}

describe("MonthSelector", () => {
  it("shows the selected month and year in their pickers", () => {
    renderSelector(october);
    expect(monthPicker()).toHaveTextContent("October");
    expect(yearPicker()).toHaveTextContent("2026");
  });

  it("names the month in French", () => {
    renderSelector(october, { locale: "fr" });
    expect(screen.getByRole("combobox", { name: "Mois" })).toHaveTextContent(
      "octobre",
    );
  });

  it("picking a month keeps the year", () => {
    const onChange = renderSelector(october);
    fireEvent.click(monthPicker());
    fireEvent.click(screen.getByRole("option", { name: "March" }));
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 2, 1));
  });

  it("picking a year keeps the month", () => {
    const onChange = renderSelector(october);
    fireEvent.click(yearPicker());
    fireEvent.click(screen.getByRole("option", { name: "2025" }));
    expect(onChange).toHaveBeenCalledWith(new Date(2025, 9, 1));
  });

  it("offers every year from the first logged entry to now", () => {
    renderSelector(october);
    fireEvent.click(yearPicker());
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "2024",
      "2025",
      "2026",
    ]);
  });

  it("disables months after the latest month in the latest year", () => {
    renderSelector(october);
    fireEvent.click(monthPicker());
    const listbox = screen.getByRole("listbox");
    expect(
      within(listbox).getByRole("option", { name: "October" }),
    ).not.toHaveAttribute("data-disabled");
    expect(
      within(listbox).getByRole("option", { name: "November" }),
    ).toHaveAttribute("data-disabled");
    expect(
      within(listbox).getByRole("option", { name: "December" }),
    ).toHaveAttribute("data-disabled");
  });

  it("disables months before the first logged month in that year", () => {
    renderSelector(new Date(2024, 5, 1));
    fireEvent.click(monthPicker());
    expect(screen.getByRole("option", { name: "February" })).toHaveAttribute(
      "data-disabled",
    );
    expect(screen.getByRole("option", { name: "March" })).not.toHaveAttribute(
      "data-disabled",
    );
  });

  it("switching to the latest year keeps a month that is not in the future", () => {
    const onChange = renderSelector(new Date(2025, 5, 1));
    fireEvent.click(yearPicker());
    fireEvent.click(screen.getByRole("option", { name: "2026" }));
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 5, 1));
  });

  it("switching to the latest year never lands in the future", () => {
    const onChange = renderSelector(new Date(2025, 11, 1));
    fireEvent.click(yearPicker());
    fireEvent.click(screen.getByRole("option", { name: "2026" }));
    expect(onChange).toHaveBeenCalledWith(october);
  });

  it("switching to the first year never lands before the first logged month", () => {
    const onChange = renderSelector(new Date(2025, 0, 1));
    fireEvent.click(yearPicker());
    fireEvent.click(screen.getByRole("option", { name: "2024" }));
    expect(onChange).toHaveBeenCalledWith(march2024);
  });

  it("goes to the previous month", () => {
    const onChange = renderSelector(october);
    fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 8, 1));
  });

  it("goes back across a year boundary", () => {
    const onChange = renderSelector(new Date(2026, 0, 1));
    fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
    expect(onChange).toHaveBeenCalledWith(new Date(2025, 11, 1));
  });

  it("cannot go before the first logged month", () => {
    const onChange = renderSelector(march2024);
    const previous = screen.getByRole("button", { name: "Previous month" });
    expect(previous).toBeDisabled();
    fireEvent.click(previous);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("goes to the next month when it is not the latest month", () => {
    const onChange = renderSelector(new Date(2026, 7, 1));
    fireEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 8, 1));
  });

  it("allows going forward from a later calendar month of an earlier year", () => {
    const onChange = renderSelector(new Date(2025, 11, 1));
    const next = screen.getByRole("button", { name: "Next month" });
    expect(next).toBeEnabled();
    fireEvent.click(next);
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 0, 1));
  });

  it("cannot go past the latest month", () => {
    const onChange = renderSelector(october);
    const next = screen.getByRole("button", { name: "Next month" });
    expect(next).toBeDisabled();
    fireEvent.click(next);
    expect(onChange).not.toHaveBeenCalled();
  });
});
