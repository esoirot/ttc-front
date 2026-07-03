import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AnyActivity } from "@/types/activities.types";

const useMyActivitiesMock = vi.fn();
vi.mock("@/hooks/activities/useActivities", () => ({
  useMyActivities: () => useMyActivitiesMock(),
}));

import { RateForm } from "./RateForm";

function makeForm(
  overrides: Partial<Parameters<typeof RateForm>[0]["form"]> = {},
) {
  return {
    name: "",
    type: "HOURLY" as const,
    amount: "",
    currency: "EUR",
    description: "",
    activityId: "",
    ...overrides,
  };
}

describe("RateForm", () => {
  beforeEach(() => {
    useMyActivitiesMock.mockReset();
    useMyActivitiesMock.mockReturnValue({
      activities: [
        { id: 1, userId: 1, name: "Translation", activityType: "TRANSLATOR" },
      ] as AnyActivity[],
    });
  });

  it("renders Name, Activity, Type, Amount, Currency, and Description fields", () => {
    render(<RateForm form={makeForm()} onChange={vi.fn()} />);
    expect(screen.getByText("Name *")).toBeInTheDocument();
    expect(screen.getByText("Activity *")).toBeInTheDocument();
    expect(screen.getByText("Type")).toBeInTheDocument();
    expect(screen.getByText("Amount *")).toBeInTheDocument();
    expect(screen.getByText("Currency")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
  });

  it("shows the placeholder when no activity is selected", () => {
    render(<RateForm form={makeForm()} onChange={vi.fn()} />);
    expect(screen.getByText("Select activity…")).toBeInTheDocument();
  });

  it("calls onChange with updated name as the Name input changes", () => {
    const onChange = vi.fn();
    render(<RateForm form={makeForm()} onChange={onChange} />);
    fireEvent.change(screen.getAllByRole("textbox")[0]!, {
      target: { value: "Standard rate" },
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Standard rate" }),
    );
  });

  it("calls onChange with updated amount as the Amount input changes", () => {
    const onChange = vi.fn();
    render(<RateForm form={makeForm()} onChange={onChange} />);
    fireEvent.change(screen.getByRole("spinbutton"), {
      target: { value: "0.05" },
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ amount: "0.05" }),
    );
  });

  it("calls onChange with updated description as the Description input changes", () => {
    const onChange = vi.fn();
    render(<RateForm form={makeForm()} onChange={onChange} />);
    const textboxes = screen.getAllByRole("textbox");
    fireEvent.change(textboxes[textboxes.length - 1]!, {
      target: { value: "Some notes" },
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ description: "Some notes" }),
    );
  });

  it("shows the currently selected type and currency in their triggers", () => {
    render(
      <RateForm
        form={makeForm({ type: "PER_WORD", currency: "USD" })}
        onChange={vi.fn()}
      />,
    );
    const comboboxes = screen.getAllByRole("combobox");
    expect(comboboxes.some((c) => c.textContent === "PER_WORD")).toBe(true);
    expect(comboboxes.some((c) => c.textContent === "USD")).toBe(true);
  });
});
