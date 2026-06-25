import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CustomFieldsInput } from "./CustomFieldsInput";

describe("CustomFieldsInput", () => {
  it("renders no field rows when fields is empty", () => {
    render(
      <CustomFieldsInput
        fields={[]}
        onAdd={vi.fn()}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.queryByPlaceholderText("Field name")).not.toBeInTheDocument();
  });

  it("renders one row per field with key/value inputs", () => {
    render(
      <CustomFieldsInput
        fields={[
          { key: "Rate", value: "0.10" },
          { key: "Notes", value: "Urgent" },
        ]}
        onAdd={vi.fn()}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getAllByPlaceholderText("Field name")).toHaveLength(2);
    expect(screen.getByDisplayValue("Rate")).toBeInTheDocument();
    expect(screen.getByDisplayValue("0.10")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Notes")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Urgent")).toBeInTheDocument();
  });

  it("calls onAdd when '+ Add field' is clicked", () => {
    const onAdd = vi.fn();
    render(
      <CustomFieldsInput
        fields={[]}
        onAdd={onAdd}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("+ Add field"));
    expect(onAdd).toHaveBeenCalled();
  });

  it("calls onUpdate with index/field/value when an input changes", () => {
    const onUpdate = vi.fn();
    render(
      <CustomFieldsInput
        fields={[{ key: "Rate", value: "0.10" }]}
        onAdd={vi.fn()}
        onUpdate={onUpdate}
        onRemove={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByDisplayValue("Rate"), {
      target: { value: "Hourly Rate" },
    });
    expect(onUpdate).toHaveBeenCalledWith(0, "key", "Hourly Rate");

    fireEvent.change(screen.getByDisplayValue("0.10"), {
      target: { value: "0.20" },
    });
    expect(onUpdate).toHaveBeenCalledWith(0, "value", "0.20");
  });

  it("calls onRemove with the row index when ✕ is clicked", () => {
    const onRemove = vi.fn();
    render(
      <CustomFieldsInput
        fields={[
          { key: "A", value: "1" },
          { key: "B", value: "2" },
        ]}
        onAdd={vi.fn()}
        onUpdate={vi.fn()}
        onRemove={onRemove}
      />,
    );

    fireEvent.click(screen.getAllByLabelText("Remove field")[1]);
    expect(onRemove).toHaveBeenCalledWith(1);
  });
});
