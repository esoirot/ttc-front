import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createIntlWrapper } from "@/test/intlWrapper";
import { TaskWordsField } from "./TaskWordsField";

function renderField(value: number | null, onSave = vi.fn()) {
  render(<TaskWordsField id="w" value={value} onSave={onSave} />, {
    wrapper: createIntlWrapper(),
  });
  return { onSave, input: screen.getByLabelText("Words") };
}

describe("TaskWordsField", () => {
  it("shows the stored word count", () => {
    expect(renderField(500).input).toHaveValue("500");
  });

  it("is empty when no word count is stored", () => {
    expect(renderField(null).input).toHaveValue("");
  });

  it("shows no error and is not marked invalid before anything is committed", () => {
    const { input } = renderField(500);
    expect(screen.queryByText(/whole number/)).not.toBeInTheDocument();
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("saves on Enter", () => {
    const { onSave, input } = renderField(null);
    fireEvent.change(input, { target: { value: "650" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSave).toHaveBeenCalledWith(650);
  });

  it("does not save on other keys", () => {
    const { onSave, input } = renderField(null);
    fireEvent.change(input, { target: { value: "650" } });
    fireEvent.keyDown(input, { key: "a" });
    expect(onSave).not.toHaveBeenCalled();
  });

  it("does not save when the value did not change", () => {
    const { onSave, input } = renderField(500);
    fireEvent.blur(input);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("marks an invalid value, then clears the error once it is fixed", () => {
    const { onSave, input } = renderField(null);
    fireEvent.change(input, { target: { value: "abc" } });
    fireEvent.blur(input);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText(/whole number/)).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "40" } });
    fireEvent.blur(input);
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(screen.queryByText(/whole number/)).not.toBeInTheDocument();
    expect(onSave).toHaveBeenCalledWith(40);
  });
});
