import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createIntlWrapper } from "@/test/intlWrapper";
import type { Locale } from "@/i18n/useLocale";
import { TaskDatePicker } from "./TaskDatePicker";

function renderPicker(
  props: Partial<Parameters<typeof TaskDatePicker>[0]> = {},
  locale: Locale = "en",
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
    { wrapper: createIntlWrapper(locale) },
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
      expect.objectContaining({
        dueDate: new Date(2026, 7, 15, 9, 0).toISOString(),
      }),
    );
  });

  it("unchecking Start Date erases it while keeping the due date", () => {
    const onUpdate = vi.fn();
    const due = new Date(2026, 6, 1, 9, 0).toISOString();
    renderPicker({
      startDate: new Date(2026, 5, 1, 9, 0).toISOString(),
      dueDate: due,
      onUpdate,
    });

    fireEvent.click(screen.getByText(/Jul 1, 2026/));
    fireEvent.click(screen.getByLabelText("Start Date"));
    fireEvent.click(screen.getByText("Save"));

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ startDate: null, dueDate: due }),
    );
  });

  it("unchecking Due Date erases it while keeping the start date", () => {
    const onUpdate = vi.fn();
    const start = new Date(2026, 5, 1, 9, 0).toISOString();
    renderPicker({
      startDate: start,
      dueDate: new Date(2026, 6, 1, 9, 0).toISOString(),
      onUpdate,
    });

    fireEvent.click(screen.getByText(/Jul 1, 2026/));
    fireEvent.click(screen.getByLabelText("Due Date"));
    fireEvent.click(screen.getByText("Save"));

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ startDate: start, dueDate: null }),
    );
  });

  it("shows a just-after-midnight due date on its local calendar day", () => {
    renderPicker({ dueDate: new Date(2026, 6, 1, 0, 30).toISOString() });

    fireEvent.click(screen.getByText(/Jul 1, 2026/));

    expect(screen.getByDisplayValue("2026-07-01")).toBeInTheDocument();
  });

  function openWithDue(
    extra: Partial<Parameters<typeof TaskDatePicker>[0]> = {},
  ) {
    const onUpdate = vi.fn();
    renderPicker({
      dueDate: new Date(2026, 6, 1, 9, 0).toISOString(),
      onUpdate,
      ...extra,
    });
    fireEvent.click(screen.getByText(/Jul 1, 2026/));
    // [due time, recurring, reminder]
    const [, recurringSelect, reminderSelect] = screen.getAllByRole("combobox");
    return { onUpdate, recurringSelect, reminderSelect };
  }

  it("saves a changed start time as the matching local instant", () => {
    const onUpdate = vi.fn();
    renderPicker({
      startDate: new Date(2026, 5, 1, 9, 0).toISOString(),
      dueDate: new Date(2026, 6, 1, 9, 0).toISOString(),
      onUpdate,
    });
    fireEvent.click(screen.getByText(/Jul 1, 2026/));

    fireEvent.click(screen.getByRole("combobox", { name: "Start time" }));
    fireEvent.click(screen.getByRole("option", { name: "08:30" }));
    fireEvent.click(screen.getByText("Save"));

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: new Date(2026, 5, 1, 8, 30).toISOString(),
      }),
    );
  });

  it("offers every half hour of the day as a time", () => {
    openWithDue();

    fireEvent.click(screen.getByRole("combobox", { name: "Due time" }));
    const times = screen.getAllByRole("option").map((o) => o.textContent);
    expect(times).toHaveLength(48);
    expect(times[0]).toBe("00:00");
    expect(times[1]).toBe("00:30");
    expect(times[47]).toBe("23:30");
  });

  it("saves the chosen recurrence and reminder", () => {
    const { onUpdate, recurringSelect, reminderSelect } = openWithDue();

    fireEvent.click(recurringSelect);
    fireEvent.click(screen.getByRole("option", { name: "Weekly" }));
    fireEvent.click(reminderSelect);
    fireEvent.click(screen.getByRole("option", { name: "1 day before" }));
    fireEvent.click(screen.getByText("Save"));

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        recurring: "WEEKLY",
        reminderOffset: "BEFORE_1D",
      }),
    );
  });

  it("choosing Never and None clears an existing recurrence and reminder", () => {
    const { onUpdate, recurringSelect, reminderSelect } = openWithDue({
      recurring: "DAILY",
      reminderOffset: "AT_DUE",
    });

    fireEvent.click(recurringSelect);
    fireEvent.click(screen.getByRole("option", { name: "Never" }));
    fireEvent.click(reminderSelect);
    fireEvent.click(screen.getByRole("option", { name: "None" }));
    fireEvent.click(screen.getByText("Save"));

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ recurring: null, reminderOffset: null }),
    );
  });

  it("saves a changed due time as the matching local instant", () => {
    const { onUpdate } = openWithDue();

    fireEvent.click(screen.getByRole("combobox", { name: "Due time" }));
    fireEvent.click(screen.getByRole("option", { name: "14:30" }));
    fireEvent.click(screen.getByText("Save"));

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        dueDate: new Date(2026, 6, 1, 14, 30).toISOString(),
      }),
    );
  });

  it("discards unsaved changes when the picker is closed and reopened", () => {
    const { onUpdate, recurringSelect } = openWithDue();

    fireEvent.click(recurringSelect);
    fireEvent.click(screen.getByRole("option", { name: "Weekly" }));
    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: "Escape",
    });
    fireEvent.click(screen.getByText(/Jul 1, 2026/));
    fireEvent.click(screen.getByText("Save"));

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ recurring: null }),
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

  it("renders French copy when locale is fr", () => {
    renderPicker({}, "fr");

    expect(screen.getByText(/Aucune date/)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Aucune date/));
    expect(screen.getByLabelText("Date de début")).toBeInTheDocument();
    expect(screen.getByText("Récurrence")).toBeInTheDocument();
  });
});
